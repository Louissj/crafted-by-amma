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

    // Use raw SQL for options (JSON field) to bypass Prisma client type issues
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [key, val] of Object.entries(data)) {
      if (key === 'options') {
        setClauses.push(`"${key}" = $${i++}::jsonb`);
        values.push(JSON.stringify(val));
      } else {
        setClauses.push(`"${key}" = $${i++}`);
        values.push(val);
      }
    }
    values.push(params.id);
    await prisma.$executeRawUnsafe(
      `UPDATE "SamplePack" SET ${setClauses.join(', ')} WHERE id = $${i}`,
      ...values
    );
    const pack = await prisma.samplePack.findUnique({ where: { id: params.id } });
    return NextResponse.json(pack);
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
