import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sanitize } from '@/lib/security';

// GET /api/products — public returns active only; admin (authenticated) returns all
export async function GET() {
  try {
    let isAdmin = false;
    try { isAdmin = !!(await getAuthUser()); } catch { /* unauthenticated */ }

    const products = await prisma.product.findMany({
      where: isAdmin ? {} : { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(products);
  } catch (e) {
    console.error('Products fetch error:', e);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — admin only, create a new product
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, name, shortName, badge, description, ingredients, usage, prices, images, sortOrder } = body;

    if (!id || !name || !shortName || !description || !ingredients) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        id: sanitize(id),
        name: sanitize(name),
        shortName: sanitize(shortName),
        badge: sanitize(badge || ''),
        description: sanitize(description),
        ingredients: sanitize(ingredients),
        usage: usage || [],
        prices: prices || {},
        images: images || [],
        sortOrder: sortOrder || 0,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'Product ID already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
