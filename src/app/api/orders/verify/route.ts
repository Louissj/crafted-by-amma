import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { sanitize, isValidPhone, calculateCartTotal } from '@/lib/security';
import { calcDeliveryCharge } from '@/lib/delivery';
import { notifyNewOrder } from '@/lib/notify';

type CartItem = { productId: string; packSize: string; count: number };
type SampleCartItem = { packKey: string; label: string; count: number; price: number; qty: number; selectedProducts: string[] };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      name, phone, city, address, pincode, deliveryZone, notes, cartItems, sampleItems,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Validate customer details
    const cleanName = sanitize(name || '');
    const cleanPhone = sanitize(phone || '');
    const cleanCity = sanitize(city || '');
    const cleanAddress = sanitize(address || '');
    const cleanPincode = sanitize(pincode || '');
    const cleanNotes = sanitize(notes || '');

    if (!cleanName || cleanName.length < 2) return NextResponse.json({ error: 'Valid name required' }, { status: 400 });
    if (!isValidPhone(cleanPhone)) return NextResponse.json({ error: 'Valid phone required' }, { status: 400 });
    if (!cleanCity || cleanCity.length < 2) return NextResponse.json({ error: 'City required' }, { status: 400 });
    if (!cleanAddress || cleanAddress.length < 5) return NextResponse.json({ error: 'Address required' }, { status: 400 });

    // Validate cart and re-calculate total server-side
    const dbProducts = await prisma.product.findMany({ where: { active: true } });
    const validIds = dbProducts.map(p => p.id);
    const priceMap: Record<string, Record<string, number>> = Object.fromEntries(
      dbProducts.map(p => [p.id, p.prices as Record<string, number>])
    );
    const allSizesRaw = dbProducts.flatMap(p => Object.keys(p.prices as object));
    const allSizes = allSizesRaw.filter((s, idx) => allSizesRaw.indexOf(s) === idx);

    const validItems: CartItem[] = (cartItems || []).filter((item: CartItem) =>
      validIds.includes(item.productId) &&
      allSizes.includes(item.packSize) &&
      Number.isInteger(item.count) && item.count >= 1 && item.count <= 10
    );

    const validSamples: SampleCartItem[] = (sampleItems || []).filter(
      (i: SampleCartItem) => i.price > 0 && i.qty >= 1
    );

    if (validItems.length === 0 && validSamples.length === 0) {
      return NextResponse.json({ error: 'Invalid cart' }, { status: 400 });
    }

    const productSubtotal = calculateCartTotal(validItems, priceMap);
    const sampleSubtotal = validSamples.reduce((s: number, i: SampleCartItem) => s + i.price * i.qty, 0);
    const totalCount = validItems.reduce((s, i) => s + i.count, 0) + validSamples.reduce((s, i) => s + i.qty, 0);
    const uniqueSizesArr = validItems.map(i => i.packSize).filter((s, idx, arr) => arr.indexOf(s) === idx);
    const uniqueSizes = uniqueSizesArr.join(',') || 'sample';
    const isKarnataka = deliveryZone === 'karnataka';

    const sampleGrams = validSamples.reduce((s: number, i: SampleCartItem) => s + 50 * i.count * i.qty, 0);

    let deliveryCharge = 0;
    try {
      const ds = await prisma.deliverySettings.findUnique({ where: { id: 'singleton' } });
      if (ds) deliveryCharge = calcDeliveryCharge(deliveryZone, validItems, ds as unknown as Parameters<typeof calcDeliveryCharge>[2], sampleGrams);
    } catch { /* use 0 */ }

    const totalAmount = productSubtotal + sampleSubtotal + deliveryCharge;

    const allProductNames = await prisma.product.findMany({ select: { id: true, shortName: true } });
    const productNameMap: Record<string, string> = Object.fromEntries(allProductNames.map(p => [p.id, p.shortName]));

    const allProducts = [
      ...validItems,
      ...validSamples.map(i => ({
        productId: `[Sample] ${i.label}`,
        packSize: i.selectedProducts?.length
          ? i.selectedProducts.map(id => productNameMap[id] || id).join(', ')
          : `${i.count} products`,
        count: i.qty,
      })),
    ];

    const order = await prisma.order.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        products: allProducts,
        quantity: uniqueSizes,
        city: cleanCity,
        address: cleanAddress,
        pincode: cleanPincode || null,
        notes: cleanNotes || null,
        paymentScreenshot: razorpayPaymentId,
        paymentMethod: 'razorpay',
        totalAmount,
        deliveryCharge,
        isKarnataka,
        count: totalCount,
        status: 'confirmed',
      },
    });

    const productNames = [
      ...validItems.map(i => `${i.productId} ${i.packSize}×${i.count}`),
      ...validSamples.map(i => `[Sample] ${i.label} (${i.selectedProducts?.map(id => productNameMap[id] || id).join(', ') || `${i.count} products`}) ×${i.qty}`),
    ].join('\n');
    notifyNewOrder({
      orderId: order.id,
      name: cleanName,
      phone: cleanPhone,
      city: cleanCity,
      products: productNames,
      total: totalAmount,
      deliveryCharge,
      isKarnataka,
    }).catch(() => {});

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
