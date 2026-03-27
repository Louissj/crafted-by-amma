import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, createToken, hashPassword, getAuthUser } from '@/lib/auth';
import { getClientIP } from '@/lib/security';
import { rateLimitLogin } from '@/lib/rateLimit';

// Verify existing session
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const { allowed, remaining } = rateLimitLogin(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again in 15 minutes.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const body = await req.json();
    const username = (body.username || '').trim().slice(0, 50);
    const password = (body.password || '').slice(0, 100);

    if (!username || !password) {
      return NextResponse.json({ error: 'Credentials required' }, { status: 400 });
    }

    // Auto-create admin on first login
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const hash = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
      await prisma.admin.create({
        data: { username: process.env.ADMIN_USERNAME || 'admin', passwordHash: hash },
      });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      // Constant-time response to prevent user enumeration
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
      return NextResponse.json({ error: `Invalid credentials. ${remaining} attempts remaining.` }, { status: 401 });
    }

    const token = await createToken({ id: admin.id, username: admin.username });

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin-token', '', { maxAge: 0, path: '/' });
  return response;
}
