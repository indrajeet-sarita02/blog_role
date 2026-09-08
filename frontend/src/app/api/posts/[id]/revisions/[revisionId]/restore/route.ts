import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Post, PostRevision } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest, { params }: { params: { id: string; revisionId: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(_req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const postId = parseInt(params.id);
  const revisionId = parseInt(params.revisionId);
  const revision = await PostRevision.findOne({ where: { id: revisionId, postId } });
  if (!revision) {
    return NextResponse.json({ success: false, message: 'Revision not found' }, { status: 404 });
  }
  const post = await Post.findByPk(postId);
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  const now = new Date();
  await post.update({
    title: revision.title, excerpt: revision.excerpt, content: revision.content,
    featuredImage: revision.featuredImage, updatedAt: now,
  });
  return NextResponse.json({ success: true, message: 'Revision restored', data: post });
}
