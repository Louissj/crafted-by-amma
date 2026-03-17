import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000);

    // ── Funnel events ────────────────────────────────────────────────
    const [pageViews, cartViews, addToCartEvents, checkoutStarts] = await Promise.all([
      prisma.analyticsEvent.findMany({ where: { type: 'page_view', createdAt: { gte: thirtyDaysAgo } }, select: { sessionId: true, createdAt: true } }),
      prisma.analyticsEvent.findMany({ where: { type: 'cart_view',  createdAt: { gte: thirtyDaysAgo } }, select: { sessionId: true } }),
      prisma.analyticsEvent.findMany({ where: { type: 'add_to_cart', createdAt: { gte: thirtyDaysAgo } }, select: { productId: true, packSize: true, sessionId: true } }),
      prisma.analyticsEvent.findMany({ where: { type: 'checkout_start', createdAt: { gte: thirtyDaysAgo } }, select: { sessionId: true } }),
    ]);

    const uniqueVisitors   = new Set(pageViews.map(e => e.sessionId).filter(Boolean)).size;
    const uniqueCartViews  = new Set(cartViews.map(e => e.sessionId).filter(Boolean)).size;
    const uniqueCheckouts  = new Set(checkoutStarts.map(e => e.sessionId).filter(Boolean)).size;

    // ── Orders ───────────────────────────────────────────────────────
    const allOrders = await prisma.order.findMany({
      select: { id: true, name: true, phone: true, city: true, products: true, totalAmount: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const paidOrders   = allOrders.filter(o => o.status !== 'cancelled');
    const recentOrders = paidOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);

    const totalRevenue   = paidOrders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
    const recentRevenue  = recentOrders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
    const avgOrderValue  = paidOrders.length ? totalRevenue / paidOrders.length : 0;

    // ── Unique customers ─────────────────────────────────────────────
    const phoneMap: Record<string, { name: string; phone: string; city: string; orders: number; spent: number; lastOrder: string }> = {};
    for (const o of paidOrders) {
      if (!phoneMap[o.phone]) {
        phoneMap[o.phone] = { name: o.name, phone: o.phone, city: o.city, orders: 0, spent: 0, lastOrder: o.createdAt.toISOString() };
      }
      phoneMap[o.phone].orders++;
      phoneMap[o.phone].spent += o.totalAmount ?? 0;
      if (o.createdAt > new Date(phoneMap[o.phone].lastOrder)) {
        phoneMap[o.phone].lastOrder = o.createdAt.toISOString();
      }
    }
    const customers = Object.values(phoneMap).sort((a, b) => b.spent - a.spent);
    const repeatCustomers = customers.filter(c => c.orders > 1).length;

    // ── Product performance ───────────────────────────────────────────
    type CartItem = { productId: string; packSize: string; count: number };
    const productStats: Record<string, { units: number; revenue: number; orders: number }> = {};

    for (const o of paidOrders) {
      const items = o.products as CartItem[];
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (!productStats[item.productId]) {
          productStats[item.productId] = { units: 0, revenue: 0, orders: 0 };
        }
        productStats[item.productId].units  += item.count;
        productStats[item.productId].orders += 1;
      }
    }

    // Attach product names from DB
    const products = await prisma.product.findMany({ select: { id: true, name: true, shortName: true, prices: true } });
    const productPerformance = products.map(p => {
      const stats = productStats[p.id] ?? { units: 0, revenue: 0, orders: 0 };
      // Estimate revenue from units × average price
      const prices = Object.values(p.prices as Record<string, number>);
      const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      stats.revenue = Math.round(stats.units * avgPrice);
      return { id: p.id, name: p.shortName || p.name, ...stats };
    }).sort((a, b) => b.units - a.units);

    // ── Add-to-cart by product ────────────────────────────────────────
    const addToCartByProduct: Record<string, number> = {};
    for (const e of addToCartEvents) {
      if (e.productId) addToCartByProduct[e.productId] = (addToCartByProduct[e.productId] ?? 0) + 1;
    }

    // ── Daily revenue (last 30 days) ─────────────────────────────────
    const dailyMap: Record<string, number> = {};
    for (const o of recentOrders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] ?? 0) + (o.totalAmount ?? 0);
    }
    const dailyRevenue = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount: Math.round(amount) }));

    // ── Top cities ────────────────────────────────────────────────────
    const cityMap: Record<string, number> = {};
    for (const o of paidOrders) cityMap[o.city] = (cityMap[o.city] ?? 0) + 1;
    const topCities = Object.entries(cityMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([city, count]) => ({ city, count }));

    // ── 7-day comparison ─────────────────────────────────────────────
    const last7Orders  = paidOrders.filter(o => new Date(o.createdAt) >= sevenDaysAgo).length;
    const prev7Orders  = paidOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) && d < sevenDaysAgo;
    }).length;

    return NextResponse.json({
      funnel: {
        visitors:      uniqueVisitors,
        cartViews:     uniqueCartViews,
        checkouts:     uniqueCheckouts,
        orders:        paidOrders.length,
        addToCartTotal: addToCartEvents.length,
      },
      revenue: {
        total:   Math.round(totalRevenue),
        last30d: Math.round(recentRevenue),
        avg:     Math.round(avgOrderValue),
      },
      orders: {
        total:    paidOrders.length,
        last7d:   last7Orders,
        prev7d:   prev7Orders,
        byStatus: (['pending','verified','confirmed','shipped','delivered','cancelled'] as const).map(s => ({
          status: s,
          count:  allOrders.filter(o => o.status === s).length,
        })),
      },
      customers: {
        total:   customers.length,
        repeat:  repeatCustomers,
        list:    customers.slice(0, 50),
      },
      productPerformance,
      addToCartByProduct,
      dailyRevenue,
      topCities,
    });
  } catch (e) {
    console.error('Analytics stats error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
