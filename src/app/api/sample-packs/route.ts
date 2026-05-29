import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const packs = await prisma.samplePack.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(packs);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
