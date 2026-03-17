import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sanitize } from '@/lib/security';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.icon === 'string') data.icon = sanitize(body.icon).slice(0, 10);
    if (typeof body.text === 'string') data.text = sanitize(body.text).slice(0, 200);
    if (typeof body.active === 'boolean') data.active = body.active;
    if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder;

    const offer = await prisma.offer.update({ where: { id }, data });
    return NextResponse.json(offer);
  } catch {
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}
