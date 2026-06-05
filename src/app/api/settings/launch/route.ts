import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const s = await prisma.$queryRaw<[{ launchMode: boolean }]>`
      SELECT "launchMode" FROM "DeliverySettings" WHERE id = 'singleton' LIMIT 1
    `;
    return NextResponse.json({ launchMode: s[0]?.launchMode ?? false });
  } catch {
    return NextResponse.json({ launchMode: false });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { launchMode } = await req.json();
  await prisma.$executeRawUnsafe(
    `UPDATE "DeliverySettings" SET "launchMode" = $1 WHERE id = 'singleton'`,
    Boolean(launchMode)
  );
  return NextResponse.json({ launchMode: Boolean(launchMode) });
}
