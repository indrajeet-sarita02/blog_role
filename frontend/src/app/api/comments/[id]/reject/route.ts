import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { memberUserSelect } from '@/database/shapes';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(params.id), deletedAt: null },
  });
  if (!comment) {
    return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
  }
  await prisma.comment.update({
    where: { id: comment.id },
    data: { status: 'rejected' },
  });
  const full = await prisma.comment.findUnique({
    where: { id: comment.id },
    include: { user: { select: memberUserSelect } },
  });
  return NextResponse.json({ success: true, message: 'Comment rejected', data: full });
}
