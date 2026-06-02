import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Raw SQL so all JSON columns (options with mrp) are always returned
    const packs = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "SamplePack" WHERE active = true ORDER BY "sortOrder" ASC
    `;
    return NextResponse.json(packs);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
