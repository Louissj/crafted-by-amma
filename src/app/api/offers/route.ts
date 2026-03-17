import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sanitize } from '@/lib/security';

// GET - public, returns all active offers
export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(offers);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

// GET all (including inactive) for admin — use ?all=1
// POST - admin only, create offer
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const icon = sanitize(body.icon || '✨').slice(0, 10);
    const text = sanitize(body.text || '').slice(0, 200);
    if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });

    const offer = await prisma.offer.create({
      data: { icon, text, sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0 },
    });
    return NextResponse.json(offer, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}
