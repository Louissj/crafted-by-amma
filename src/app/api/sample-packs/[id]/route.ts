import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if ('name' in body) data.name = String(body.name);
    if ('description' in body) data.description = String(body.description);
    if ('options' in body) data.options = body.options;
    if ('active' in body) data.active = Boolean(body.active);

    const pack = await prisma.samplePack.update({ where: { id: params.id }, data });
    return NextResponse.json(pack);
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
