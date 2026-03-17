import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sanitize } from '@/lib/security';

const ID = 'singleton';

const DEFAULTS = {
  id: ID,
  baseCharge: 50,
  freeAboveAmt: 350,
  karnatakFree: true,
  note: 'Free delivery in Karnataka for orders ₹350+',
};

export async function GET() {
  try {
    let s = await prisma.deliverySettings.findUnique({ where: { id: ID } });
    if (!s) {
      s = await prisma.deliverySettings.create({ data: DEFAULTS });
    }
    return NextResponse.json(s);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch delivery settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.baseCharge === 'number' && body.baseCharge >= 0) data.baseCharge = body.baseCharge;
    if (typeof body.freeAboveAmt === 'number' && body.freeAboveAmt >= 0) data.freeAboveAmt = body.freeAboveAmt;
    if (typeof body.karnatakFree === 'boolean') data.karnatakFree = body.karnatakFree;
    if (typeof body.note === 'string') data.note = sanitize(body.note).slice(0, 500);

    const s = await prisma.deliverySettings.upsert({
      where: { id: ID },
      create: { ...DEFAULTS, ...data },
      update: data,
    });
    return NextResponse.json(s);
  } catch {
    return NextResponse.json({ error: 'Failed to update delivery settings' }, { status: 500 });
  }
}
