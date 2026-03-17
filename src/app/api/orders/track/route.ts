import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getClientIP, isValidPhone } from '@/lib/security';
import { rateLimitTrack } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const { allowed } = rateLimitTrack(ip);
  if (!allowed) return NextResponse.json({ error: 'Too many requests. Try again in 5 minutes.' }, { status: 429 });

  const phone = req.nextUrl.searchParams.get('phone')?.trim() || '';
  if (!isValidPhone(phone)) return NextResponse.json({ error: 'Enter a valid Indian phone number' }, { status: 400 });

  // Normalize: strip +91/91 prefix, keep last 10 digits
  const normalized = phone.replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91)/, '');

  // Search for phone ending with these 10 digits
  const orders = await prisma.order.findMany({
    where: { phone: { endsWith: normalized } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      status: true,
      products: true,
      quantity: true,
      totalAmount: true,
      deliveryCharge: true,
      isKarnataka: true,
      city: true,
      count: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ orders });
}
