import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAuthUser } from '@/lib/auth';
import { getClientIP, sanitize, isValidPhone, validateFile, secureFilename, calculateOrderTotal } from '@/lib/security';
import { rateLimitOrder, rateLimitApi } from '@/lib/rateLimit';

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
    const productsRaw = formData.get('products') as string || '[]';
    const quantity = sanitize(formData.get('quantity') as string || '1kg');
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

    // Validate products
    let products: string[];
    try {
      products = JSON.parse(productsRaw);
      if (!Array.isArray(products) || products.length === 0) throw new Error();
      const validIds = ['millet-malt', 'instant-dosa'];
      products = products.filter(p => validIds.includes(p));
      if (products.length === 0) throw new Error();
    } catch {
      return NextResponse.json({ error: 'Select at least one valid product' }, { status: 400 });
    }

    // Validate quantity
    const validQty = ['250g', '500g', '1kg', '2kg'];
    if (!validQty.includes(quantity)) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    // Handle file upload
    let screenshotPath = '';
    if (screenshot && screenshot.size > 0) {
      const fileCheck = validateFile(screenshot);
      if (!fileCheck.valid) {
        return NextResponse.json({ error: fileCheck.error }, { status: 400 });
      }
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filename = secureFilename(screenshot.name);
      const filepath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await screenshot.arrayBuffer());
      await writeFile(filepath, buffer);
      screenshotPath = `/uploads/${filename}`;
    }

    // Calculate total server-side
    const productTotal = calculateOrderTotal(products, quantity);

    // Fetch delivery settings and calculate charge
    let deliveryCharge = 0;
    try {
      const deliverySettings = await prisma.deliverySettings.findUnique({ where: { id: 'singleton' } });
      if (deliverySettings) {
        const qualifiesFree = isKarnataka && deliverySettings.karnatakFree && productTotal >= deliverySettings.freeAboveAmt;
        deliveryCharge = qualifiesFree ? 0 : deliverySettings.baseCharge;
      }
    } catch { /* use 0 if settings not found */ }

    const totalAmount = productTotal + deliveryCharge;

    const order = await prisma.order.create({
      data: {
        name, phone,
        products: JSON.stringify(products),
        quantity, city, address, notes,
        paymentScreenshot: screenshotPath || null,
        totalAmount,
        deliveryCharge,
        isKarnataka,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// GET - List orders (admin only)
export async function GET(req: NextRequest) {
  try {
    // Auth check
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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const where = status && status !== 'all' ? { status } : {};
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
