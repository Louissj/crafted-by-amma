import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { getClientIP, sanitize, isValidPhone, validateFile, calculateCartTotal } from '@/lib/security';
import { rateLimitOrder, rateLimitApi } from '@/lib/rateLimit';
import { uploadToS3 } from '@/lib/s3';
import { notifyNewOrder } from '@/lib/notify';

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
    const isKarnataka = formData.get('isKarnataka') === 'true';
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

    // Fetch delivery settings and calculate charge
    let deliveryCharge = 0;
    try {
      const deliverySettings = await prisma.deliverySettings.findUnique({ where: { id: 'singleton' } });
      if (deliverySettings) {
        const qualifiesFree = isKarnataka && deliverySettings.karnatakFree && productSubtotal >= deliverySettings.freeAboveAmt;
        deliveryCharge = qualifiesFree ? 0 : deliverySettings.baseCharge;
      }
    } catch { /* use 0 if settings not found */ }

    const totalAmount = productSubtotal + deliveryCharge;

    const order = await prisma.order.create({
      data: {
        name, phone,
        products: cartItems,
        quantity: uniqueSizes,
        city, address, notes,
        paymentScreenshot: screenshotPath || null,
        totalAmount,
        deliveryCharge,
        isKarnataka,
        count: totalCount,
        status: 'pending',
      },
    });

    // Fire-and-forget notification (doesn't block order response)
    const productNames = cartItems.map(i => `${i.productId} ${i.packSize}×${i.count}`).join(', ');
    notifyNewOrder({ orderId: order.id, name, phone, city, products: productNames, total: totalAmount }).catch(() => {});

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (phone) where.phone = phone;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
