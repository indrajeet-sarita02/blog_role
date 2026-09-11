import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
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
  const revision = await prisma.postRevision.findFirst({ where: { id: revisionId, postId } });
  if (!revision) {
    return NextResponse.json({ success: false, message: 'Revision not found' }, { status: 404 });
  }
  const post = await prisma.post.findUnique({ where: { id: postId, deletedAt: null } });
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      title: revision.title, excerpt: revision.excerpt, content: revision.content,
      featuredImage: revision.featuredImage,
    },
  });
  return NextResponse.json({ success: true, message: 'Revision restored', data: updated });
}
