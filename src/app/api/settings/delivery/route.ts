import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sanitize } from '@/lib/security';

const ID = 'singleton';

const DEFAULTS = {
  id: ID,
  baseCharge: 50,
  outstationCharge: 120,
  freeAboveAmt: 350,
  karnatakFree: true,
  note: 'Free delivery in Karnataka for orders 1kg packs',
};

export async function GET() {
  try {
    // Use raw SQL to ensure new JSON columns (slabs, launchMode) are always returned
    const rows = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "DeliverySettings" WHERE id = ${ID} LIMIT 1
    `;
    const headers = { 'Cache-Control': 'no-store' };
    if (rows.length > 0) return NextResponse.json(rows[0], { headers });
    const s = await prisma.deliverySettings.create({ data: DEFAULTS });
    return NextResponse.json(s, { headers });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch delivery settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();

    const sortSlabs = (arr: unknown) =>
      Array.isArray(arr)
        ? arr
            .filter((s: { maxGrams: unknown; charge: unknown }) => typeof s.maxGrams === 'number' && typeof s.charge === 'number')
            .sort((a: { maxGrams: number }, b: { maxGrams: number }) => a.maxGrams - b.maxGrams)
        : undefined;

    // Build update payload — only include fields that were actually sent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};
    if (typeof body.baseCharge === 'number' && body.baseCharge >= 0) data.baseCharge = body.baseCharge;
    if (typeof body.outstationCharge === 'number' && body.outstationCharge >= 0) data.outstationCharge = body.outstationCharge;
    if (typeof body.freeAboveAmt === 'number' && body.freeAboveAmt >= 0) data.freeAboveAmt = body.freeAboveAmt;
    if (typeof body.karnatakFree === 'boolean') data.karnatakFree = body.karnatakFree;
    if (typeof body.note === 'string') data.note = sanitize(body.note).slice(0, 500);
    if (Array.isArray(body.karnatakaSlabs))  data.karnatakaSlabs  = sortSlabs(body.karnatakaSlabs);
    if (Array.isArray(body.southIndiaSlabs)) data.southIndiaSlabs = sortSlabs(body.southIndiaSlabs);
    if (Array.isArray(body.northIndiaSlabs)) data.northIndiaSlabs = sortSlabs(body.northIndiaSlabs);

    if (Object.keys(data).length === 0) {
      const rows = await prisma.$queryRaw<Record<string, unknown>[]>`SELECT * FROM "DeliverySettings" WHERE id = ${ID} LIMIT 1`;
      return NextResponse.json(rows[0] ?? null);
    }

    await prisma.deliverySettings.update({ where: { id: ID }, data });

    // Always read back with raw SQL so JSON columns are returned correctly
    const rows = await prisma.$queryRaw<Record<string, unknown>[]>`SELECT * FROM "DeliverySettings" WHERE id = ${ID} LIMIT 1`;
    return NextResponse.json(rows[0] ?? null);
  } catch (err) {
    console.error('Delivery settings PUT error:', err);
    return NextResponse.json({ error: 'Failed to update delivery settings' }, { status: 500 });
  }
}
