import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// PATCH — admin: approve / reject
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { approved } = await req.json();
  const review = await prisma.review.update({
    where: { id: params.id },
    data: { approved: Boolean(approved) },
  });
  return NextResponse.json({ review });
}

// DELETE — admin: remove a review
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.review.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
