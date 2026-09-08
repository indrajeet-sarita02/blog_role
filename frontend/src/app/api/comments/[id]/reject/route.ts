import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Comment, User } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const comment = await Comment.findByPk(parseInt(params.id));
  if (!comment) {
    return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
  }
  await comment.update({ status: 'rejected' });
  const full = await Comment.findByPk(comment.id, { include: [{ model: User, as: 'user' }] });
  return NextResponse.json({ success: true, message: 'Comment rejected', data: full });
}
