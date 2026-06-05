import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { pin: string } }) {
  const pin = params.pin.replace(/\D/g, '');
  if (pin.length !== 6) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timer);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    clearTimeout(timer);
    console.error('Pincode API error:', err);
    return NextResponse.json({ error: 'API unreachable' }, { status: 503 });
  }
}
