import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { memberUserSelect } from '@/database/shapes';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const commentInclude = { user: { select: memberUserSelect } };

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(params.id), deletedAt: null },
    include: commentInclude,
  });
  if (!comment) {
    return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Comment fetched', data: comment });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(params.id), deletedAt: null },
  });
  if (!comment) {
    return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
  }
  await prisma.comment.update({
    where: { id: comment.id },
    data: body.content !== undefined ? { content: body.content } : {},
  });
  const full = await prisma.comment.findUnique({
    where: { id: comment.id },
    include: commentInclude,
  });
  return NextResponse.json({ success: true, message: 'Comment updated', data: full });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(_req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(params.id), deletedAt: null },
  });
  if (!comment) {
    return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
  }
  await prisma.comment.updateMany({
    where: { id: comment.id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ success: true, message: 'Comment deleted' });
}
