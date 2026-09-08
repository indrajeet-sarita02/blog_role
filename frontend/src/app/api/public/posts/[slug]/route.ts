import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Post, User, Category, Tag } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  await ensureDb();
  const post = await Post.findOne({
    where: { slug: params.slug, status: 'published', visibility: 'public' },
    include: [
      { model: User, as: 'author' },
      { model: Category, as: 'category' },
      { model: Tag, as: 'tags' },
    ],
  });
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Post fetched', data: post });
}
