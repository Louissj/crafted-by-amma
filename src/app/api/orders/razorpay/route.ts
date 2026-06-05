import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/db';
import { getClientIP, calculateCartTotal } from '@/lib/security';
import { calcDeliveryCharge } from '@/lib/delivery';
import { rateLimitOrder } from '@/lib/rateLimit';

type CartItem = { productId: string; packSize: string; count: number };
type SampleCartItem = { packKey: string; label: string; count: number; price: number; qty: number; selectedProducts: string[] };

export async function POST(req: NextRequest) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  try {
    const ip = getClientIP(req);
    const { allowed } = rateLimitOrder(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const cartItems: CartItem[] = body.cartItems || [];
    const sampleItems: SampleCartItem[] = body.sampleItems || [];
    const deliveryZone: string = body.deliveryZone || 'north-india';

    const dbProducts = await prisma.product.findMany({ where: { active: true } });
    const validIds = dbProducts.map(p => p.id);
    const priceMap: Record<string, Record<string, number>> = Object.fromEntries(
      dbProducts.map(p => [p.id, p.prices as Record<string, number>])
    );
    const allSizesRaw = dbProducts.flatMap(p => Object.keys(p.prices as object));
    const allSizes = allSizesRaw.filter((s, idx) => allSizesRaw.indexOf(s) === idx);

    const validItems = cartItems.filter((item: CartItem) =>
      validIds.includes(item.productId) &&
      allSizes.includes(item.packSize) &&
      Number.isInteger(item.count) && item.count >= 1 && item.count <= 10
    );

    const validSamples = sampleItems.filter(i => i.price > 0 && i.qty >= 1);

    if (validItems.length === 0 && validSamples.length === 0) {
      return NextResponse.json({ error: 'Cart is empty or invalid' }, { status: 400 });
    }

    const productSubtotal = calculateCartTotal(validItems, priceMap);
    const sampleSubtotal = validSamples.reduce((s, i) => s + i.price * i.qty, 0);

    let deliveryCharge = 0;
    try {
      const ds = await prisma.deliverySettings.findUnique({ where: { id: 'singleton' } });
      if (ds) deliveryCharge = calcDeliveryCharge(deliveryZone, validItems, ds as unknown as Parameters<typeof calcDeliveryCharge>[2]);
    } catch { /* use 0 */ }

    const grandTotal = productSubtotal + sampleSubtotal + deliveryCharge;

    const order = await razorpay.orders.create({
      amount: grandTotal * 100, // paise
      currency: 'INR',
      notes: { source: 'craftedbyamma.in', deliveryZone },
    });

    return NextResponse.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
