import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sanitize, isValidPhone, getClientIP } from '@/lib/security';
import { normaliseCode } from '@/lib/referralRules';
import { rateLimitApi } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// Ambiguous characters (0/O, 1/I) left out — codes get read off a phone screen
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomSuffix(len = 4): string {
  let out = '';
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return out;
}

// "Priya Rao" -> "CBAPRIYA7K2M" (CBA = Crafted by Amma)
function buildCode(name: string): string {
  const stem = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'AMMA';
  return `CBA${stem}${randomSuffix()}`;
}

// GET /api/referrals?code=XXX — public: is this code real?
export async function GET(req: NextRequest) {
  try {
    const code = normaliseCode(new URL(req.url).searchParams.get('code'));
    if (!code) return NextResponse.json({ valid: false, error: 'No code given' }, { status: 400 });

    const referrer = await prisma.referrer.findUnique({
      where: { code },
      select: { code: true, name: true, active: true },
    });

    if (!referrer || !referrer.active) {
      return NextResponse.json({ valid: false, error: 'That referral code is not valid' });
    }
    // Name only — never expose the referrer's phone to a customer
    return NextResponse.json({ valid: true, code: referrer.code, name: referrer.name });
  } catch {
    return NextResponse.json({ valid: false, error: 'Could not check that code' }, { status: 500 });
  }
}

// POST /api/referrals — public: sign up as a referrer, get a code back
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const { allowed } = rateLimitApi(ip);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json();
    const name = sanitize(String(body.name || '').trim());
    const phone = String(body.phone || '').trim();

    if (name.length < 2) return NextResponse.json({ error: 'Enter your full name' }, { status: 400 });
    if (!isValidPhone(phone)) return NextResponse.json({ error: 'Enter a valid Indian WhatsApp number' }, { status: 400 });

    // One code per phone — re-registering returns the existing code rather than a second one
    const existing = await prisma.referrer.findFirst({ where: { phone, active: true } });
    if (existing) {
      return NextResponse.json({ code: existing.code, name: existing.name, existing: true });
    }

    // Retry on the (vanishingly rare) code collision
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = buildCode(name);
      const clash = await prisma.referrer.findUnique({ where: { code }, select: { id: true } });
      if (clash) continue;
      const created = await prisma.referrer.create({ data: { code, name, phone } });
      return NextResponse.json({ code: created.code, name: created.name, existing: false }, { status: 201 });
    }
    return NextResponse.json({ error: 'Could not generate a code, please try again' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Could not create referral code' }, { status: 500 });
  }
}
