import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sanitize, isValidPhone, calculateCartTotal } from '@/lib/security';

type CartItem = { productId: string; packSize: string; count: number };

const VALID_STATUSES = ['pending', 'verified', 'confirmed', 'shipped', 'delivered'];
const VALID_PAYMENT_METHODS = ['cash', 'upi', 'bank-transfer', 'other'];

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      name, phone, city, address, pincode, notes,
      items, deliveryCharge, isKarnataka,
      paymentMethod, status, totalAmountOverride,
    } = body;

    const cleanName = sanitize(name || '');
    const cleanPhone = sanitize(phone || '');
    const cleanCity = sanitize(city || '');
    const cleanAddress = sanitize(address || '');
    const cleanPincode = sanitize(pincode || '');
    const cleanNotes = sanitize(notes || '');

    if (!cleanName || cleanName.length < 2) return NextResponse.json({ error: 'Valid name required' }, { status: 400 });
    if (!isValidPhone(cleanPhone)) return NextResponse.json({ error: 'Valid phone required' }, { status: 400 });
    if (!cleanCity || cleanCity.length < 2) return NextResponse.json({ error: 'City required' }, { status: 400 });
    if (!cleanAddress || cleanAddress.length < 2) return NextResponse.json({ error: 'Address required' }, { status: 400 });

    const dbProducts = await prisma.product.findMany();
    const priceMap: Record<string, Record<string, number>> = Object.fromEntries(
      dbProducts.map(p => [p.id, p.prices as Record<string, number>])
    );
    const validIds = dbProducts.map(p => p.id);

    const validItems: CartItem[] = (items || []).filter((item: CartItem) =>
      validIds.includes(item.productId) &&
      priceMap[item.productId]?.[item.packSize] !== undefined &&
      Number.isInteger(item.count) && item.count >= 1 && item.count <= 50
    );

    if (validItems.length === 0) {
      return NextResponse.json({ error: 'Select at least one valid product' }, { status: 400 });
    }

    const cleanDeliveryCharge = Number.isFinite(deliveryCharge) && deliveryCharge >= 0 ? deliveryCharge : 0;
    const computedTotal = calculateCartTotal(validItems, priceMap) + cleanDeliveryCharge;
    const totalAmount = Number.isFinite(totalAmountOverride) && totalAmountOverride >= 0 ? totalAmountOverride : computedTotal;

    const totalCount = validItems.reduce((s, i) => s + i.count, 0);
    const uniqueSizes = validItems.map(i => i.packSize).filter((s, idx, arr) => arr.indexOf(s) === idx).join(',');

    const cleanStatus = VALID_STATUSES.includes(status) ? status : 'confirmed';
    const cleanPaymentMethod = VALID_PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : 'cash';

    const order = await prisma.order.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        products: validItems,
        quantity: uniqueSizes || 'mixed',
        city: cleanCity,
        address: cleanAddress,
        pincode: cleanPincode || null,
        notes: cleanNotes ? `[Offline order] ${cleanNotes}` : '[Offline order]',
        paymentMethod: cleanPaymentMethod,
        totalAmount,
        deliveryCharge: cleanDeliveryCharge,
        isKarnataka: !!isKarnataka,
        count: totalCount,
        status: cleanStatus,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('Manual order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
