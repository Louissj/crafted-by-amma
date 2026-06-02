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
    if (rows.length > 0) return NextResponse.json(rows[0]);
    // Create with defaults if not found
    const s = await prisma.deliverySettings.create({ data: DEFAULTS });
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
    if (typeof body.outstationCharge === 'number' && body.outstationCharge >= 0) data.outstationCharge = body.outstationCharge;
    if (typeof body.freeAboveAmt === 'number' && body.freeAboveAmt >= 0) data.freeAboveAmt = body.freeAboveAmt;
    if (typeof body.karnatakFree === 'boolean') data.karnatakFree = body.karnatakFree;
    if (typeof body.note === 'string') data.note = sanitize(body.note).slice(0, 500);
    const sortSlabs = (arr: unknown) =>
      Array.isArray(arr)
        ? arr
            .filter((s: { maxGrams: number; charge: number }) => typeof s.maxGrams === 'number' && typeof s.charge === 'number')
            .sort((a: { maxGrams: number }, b: { maxGrams: number }) => a.maxGrams - b.maxGrams)
        : undefined;

    if (Array.isArray(body.karnatakaSlabs))  data.karnatakaSlabs  = sortSlabs(body.karnatakaSlabs);
    if (Array.isArray(body.southIndiaSlabs)) data.southIndiaSlabs = sortSlabs(body.southIndiaSlabs);
    if (Array.isArray(body.northIndiaSlabs)) data.northIndiaSlabs = sortSlabs(body.northIndiaSlabs);

    // Use raw SQL to bypass any Prisma client regeneration issues with new JSON columns
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (['karnatakaSlabs','southIndiaSlabs','northIndiaSlabs'].includes(key)) {
        setClauses.push(`"${key}" = $${idx++}::jsonb`);
        values.push(JSON.stringify(val));
      } else {
        setClauses.push(`"${key}" = $${idx++}`);
        values.push(val);
      }
    }
    if (setClauses.length === 0) {
      const s = await prisma.deliverySettings.findUnique({ where: { id: ID } });
      return NextResponse.json(s);
    }
    values.push(ID);
    await prisma.$executeRawUnsafe(
      `UPDATE "DeliverySettings" SET ${setClauses.join(', ')} WHERE id = $${idx}`,
      ...values
    );
    const s = await prisma.deliverySettings.findUnique({ where: { id: ID } });
    return NextResponse.json(s);
  } catch {
    return NextResponse.json({ error: 'Failed to update delivery settings' }, { status: 500 });
  }
}
