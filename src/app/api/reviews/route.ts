import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sanitize } from '@/lib/security';
import { rateLimitApi } from '@/lib/rateLimit';
import { getClientIP } from '@/lib/security';

// GET — public (approved only) or admin (all)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('all') === '1';

    if (isAdmin) {
      const user = await getAuthUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
      return NextResponse.json({ reviews });
    }

    const reviews = await prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, place: true, rating: true, text: true, createdAt: true },
    });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST — public: submit a review (goes to pending)
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const { allowed } = rateLimitApi(ip);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json();
    const name  = sanitize(String(body.name  || '').trim());
    const place = sanitize(String(body.place || '').trim());
    const text  = sanitize(String(body.text  || '').trim());
    const rating = Number(body.rating);

    if (!name || name.length < 2)   return NextResponse.json({ error: 'Name required' }, { status: 400 });
    if (!place || place.length < 2) return NextResponse.json({ error: 'Place required' }, { status: 400 });
    if (!text  || text.length < 10) return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });

    await prisma.review.create({ data: { name, place, text, rating, approved: false } });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
