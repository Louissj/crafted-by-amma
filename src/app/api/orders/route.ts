import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { getClientIP, sanitize, isValidPhone, validateFile, calculateCartTotal } from '@/lib/security';
import { rateLimitOrder, rateLimitApi } from '@/lib/rateLimit';
import { uploadToS3 } from '@/lib/s3';
import { notifyNewOrder } from '@/lib/notify';
import { calcDeliveryCharge } from '@/lib/delivery';

type CartItem = { productId: string; packSize: string; count: number };

// POST - Create new order (public, rate limited)
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const { allowed } = rateLimitOrder(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many orders. Please try again later.' }, { status: 429 });
    }

    const formData = await req.formData();
    const name = sanitize(formData.get('name') as string || '');
    const phone = sanitize(formData.get('phone') as string || '');
    const cartItemsRaw = formData.get('cartItems') as string || '[]';
    const city = sanitize(formData.get('city') as string || '');
    const address = sanitize(formData.get('address') as string || '');
    const notes = sanitize(formData.get('notes') as string || '');
    const pincode = sanitize(formData.get('pincode') as string || '');
    const deliveryZone = (formData.get('deliveryZone') as string) || 'india'; // 'karnataka' | 'india' | 'international'
    const isKarnataka = deliveryZone === 'karnataka';
    const screenshot = formData.get('screenshot') as File | null;

    // Validate required fields
    if (!name || name.length < 2) return NextResponse.json({ error: 'Valid name required' }, { status: 400 });
    if (!isValidPhone(phone)) return NextResponse.json({ error: 'Valid Indian phone number required' }, { status: 400 });
    if (!city || city.length < 2) return NextResponse.json({ error: 'City required' }, { status: 400 });
    if (!address || address.length < 5) return NextResponse.json({ error: 'Full address required' }, { status: 400 });

    // Fetch active products from DB for validation and pricing
    const dbProducts = await prisma.product.findMany({ where: { active: true } });
    const validIds = dbProducts.map(p => p.id);
    const priceMap: Record<string, Record<string, number>> = Object.fromEntries(
      dbProducts.map(p => [p.id, p.prices as Record<string, number>])
    );
    const allSizes = dbProducts.flatMap(p => Object.keys(p.prices as object));
    const allValidSizes = allSizes.filter((s, idx) => allSizes.indexOf(s) === idx);

    let cartItems: CartItem[];
    try {
      const parsed = JSON.parse(cartItemsRaw);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error();
      cartItems = parsed.filter((item: CartItem) =>
        validIds.includes(item.productId) &&
        allValidSizes.includes(item.packSize) &&
        Number.isInteger(item.count) && item.count >= 1 && item.count <= 10
      );
      if (cartItems.length === 0) throw new Error();
    } catch {
      return NextResponse.json({ error: 'Select at least one valid product' }, { status: 400 });
    }

    // Handle file upload to S3
    let screenshotPath = '';
    if (screenshot && screenshot.size > 0) {
      const fileCheck = validateFile(screenshot);
      if (!fileCheck.valid) {
        return NextResponse.json({ error: fileCheck.error }, { status: 400 });
      }
      screenshotPath = await uploadToS3(screenshot, 'screenshots');
    }

    // Calculate total server-side using DB prices
    const productSubtotal = calculateCartTotal(cartItems, priceMap);
    const totalCount = cartItems.reduce((s, i) => s + i.count, 0);
    const uniqueSizes = cartItems.map(i => i.packSize).filter((s, idx, arr) => arr.indexOf(s) === idx).join(',');

    // Fetch delivery settings and calculate weight-based charge
    let deliveryCharge = 0;
    try {
      const ds = await prisma.deliverySettings.findUnique({ where: { id: 'singleton' } });
      if (ds) deliveryCharge = calcDeliveryCharge(deliveryZone, cartItems, ds as unknown as Parameters<typeof calcDeliveryCharge>[2]);
    } catch { /* use 0 if settings not found */ }

    const totalAmount = productSubtotal + deliveryCharge;

    const order = await prisma.order.create({
      data: {
        name, phone,
        products: cartItems,
        quantity: uniqueSizes,
        city, address, notes,
        pincode: pincode || null,
        paymentScreenshot: screenshotPath || null,
        totalAmount,
        deliveryCharge,
        isKarnataka,
        count: totalCount,
        status: 'pending',
      },
    });

    // Fire-and-forget notification (doesn't block order response)
    const productNames = cartItems.map(i => `${i.productId} ${i.packSize}×${i.count}`).join('\n');
    notifyNewOrder({ orderId: order.id, name, phone, city, products: productNames, total: totalAmount, deliveryCharge, isKarnataka }).catch(() => {});

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// GET - List orders (admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = getClientIP(req);
    const { allowed } = rateLimitApi(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const phone  = searchParams.get('phone');
    const type   = searchParams.get('type'); // 'offline' | 'online'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const where: Record<string, unknown> = { deleted: false };
    if (status && status !== 'all') where.status = status;
    if (phone) where.phone = phone;
    if (type === 'offline') where.notes = { startsWith: '[Offline order]' };
    // Online = notes is null OR notes does not start with '[Offline order]'
    if (type === 'online') where.OR = [
      { notes: null },
      { notes: { not: { startsWith: '[Offline order]' } } },
    ];

    const baseWhere = { deleted: false };
    const [orders, total, revenueAgg, pendingCount, confirmedCount, globalTotal] = await Promise.all([
      prisma.order.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      prisma.order.count({ where }),
      // Aggregate stats always reflect full non-deleted DB (ignore page/status filters)
      !phone ? prisma.order.aggregate({
        where: { ...baseWhere, status: { not: 'cancelled' }, totalAmount: { not: null } },
        _sum: { totalAmount: true },
      }) : Promise.resolve(null),
      !phone ? prisma.order.count({ where: { ...baseWhere, status: 'pending' } }) : Promise.resolve(null),
      !phone ? prisma.order.count({ where: { ...baseWhere, status: { in: ['confirmed', 'shipped', 'delivered'] } } }) : Promise.resolve(null),
      !phone ? prisma.order.count({ where: baseWhere }) : Promise.resolve(null),
    ]);

    const aggStats = (!phone && revenueAgg && pendingCount !== null && confirmedCount !== null && globalTotal !== null)
      ? {
          total: globalTotal,
          revenue: (revenueAgg as { _sum: { totalAmount: number | null } })._sum.totalAmount || 0,
          pending: pendingCount as number,
          confirmed: confirmedCount as number,
        }
      : null;

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit), aggStats });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
