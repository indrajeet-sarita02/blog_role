import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { shapePost, memberUserSelect } from '@/database/shapes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  await ensureDb();
  const post = await prisma.post.findFirst({
    where: { slug: params.slug, status: 'published', visibility: 'public', deletedAt: null },
    include: {
      author: { select: memberUserSelect },
      category: true,
      tags: { include: { tag: true } },
    },
  });
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Post fetched', data: shapePost(post) });
}
