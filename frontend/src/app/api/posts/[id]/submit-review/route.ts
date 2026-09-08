import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Post } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const post = await Post.findByPk(parseInt(params.id));
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  const now = new Date();
  await post.update({ status: 'pending_review', updatedAt: now });
  return NextResponse.json({ success: true, message: 'Post submitted for review', data: post });
}
