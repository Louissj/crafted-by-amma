import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy — avoids CORS issues with the pincode API
export async function GET(_req: NextRequest, { params }: { params: { pin: string } }) {
  const pin = params.pin.replace(/\D/g, '');
  if (pin.length !== 6) return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([{ Status: 'Error' }], { status: 200 });
  }
}
