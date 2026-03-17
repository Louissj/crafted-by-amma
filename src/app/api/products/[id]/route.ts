import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sanitize } from '@/lib/security';

// GET /api/products/[id] — public
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

// PATCH /api/products/[id] — admin only
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const allowed = ['name', 'shortName', 'badge', 'description', 'ingredients', 'usage', 'prices', 'images', 'active', 'sortOrder'];
    const data: Record<string, unknown> = {};

    for (const key of allowed) {
      if (key in body) {
        if (['usage', 'prices', 'images', 'active', 'sortOrder'].includes(key)) {
          data[key] = body[key];
        } else {
          data[key] = sanitize(String(body[key]));
        }
      }
    }

    const product = await prisma.product.update({ where: { id: params.id }, data });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
