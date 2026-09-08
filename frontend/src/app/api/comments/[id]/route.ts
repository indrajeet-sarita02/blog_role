import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Comment, User } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const include = [{ model: User, as: 'user' }];

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const comment = await Comment.findByPk(parseInt(params.id), { include });
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
  const comment = await Comment.findByPk(parseInt(params.id));
  if (!comment) {
    return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
  }
  if (body.content !== undefined) comment.content = body.content;
  await comment.save();
  const full = await Comment.findByPk(comment.id, { include });
  return NextResponse.json({ success: true, message: 'Comment updated', data: full });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(_req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const comment = await Comment.findByPk(parseInt(params.id));
  if (!comment) {
    return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
  }
  await comment.destroy();
  return NextResponse.json({ success: true, message: 'Comment deleted' });
}
