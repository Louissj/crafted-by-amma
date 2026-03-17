import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getClientIP } from '@/lib/security';
import { rateLimitApi } from '@/lib/rateLimit';

const VALID_TYPES = ['page_view', 'cart_view', 'add_to_cart', 'checkout_start', 'order_placed'] as const;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const { allowed } = rateLimitApi(ip);
    if (!allowed) return NextResponse.json({ ok: false }, { status: 429 });

    const body = await req.json();
    const { type, sessionId, productId, packSize, page, metadata } = body;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        type,
        sessionId: sessionId ? String(sessionId).slice(0, 64) : null,
        productId: productId ? String(productId).slice(0, 64) : null,
        packSize: packSize ? String(packSize).slice(0, 32) : null,
        page: page ? String(page).slice(0, 128) : null,
        metadata: metadata ?? undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
