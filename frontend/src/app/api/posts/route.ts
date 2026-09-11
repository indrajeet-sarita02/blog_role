import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { shapePost, memberUserSelect } from '@/database/shapes';
import { getUserIdFromRequest } from '@/lib/auth/server';
import { slugify } from '@/lib/utils/slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const postInclude = {
  author: { select: memberUserSelect },
  category: true,
  tags: { include: { tag: true } },
};

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const authorId = params.get('authorId');
  const status = params.get('status');
  const search = params.get('search');

  const where: Record<string, unknown> = { deletedAt: null };
  if (authorId) where.authorId = parseInt(authorId);
  if (status) where.status = status;
  if (search) {
    const s = search.toLowerCase();
    const all = await prisma.post.findMany({
      where: { ...where, OR: [{ title: { contains: s, mode: 'insensitive' } }, { excerpt: { contains: s, mode: 'insensitive' } }] },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, message: 'Posts fetched', data: all.map(shapePost), meta: { page: 1, limit: all.length, total: all.length, totalPages: 1 } });
  }

  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);
  const [count, rows] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({ where, include: postInclude, take: limit, skip: (page - 1) * limit, orderBy: { createdAt: 'desc' } }),
  ]);

  return NextResponse.json({
    success: true, message: 'Posts fetched', data: rows.map(shapePost),
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { title, slug, content, excerpt, categoryId, tagIds, status, visibility, featuredImage } = body;
  if (!title) {
    return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
  }

  const finalSlug = slug || slugify(title);
  const now = new Date();
  const post = await prisma.post.create({
    data: {
      authorId: userId, categoryId: categoryId ?? null, title,
      slug: finalSlug, excerpt: excerpt ?? null, content: content ?? null,
      featuredImage: featuredImage ?? null, status: status || 'draft',
      visibility: visibility || 'public',
      publishedAt: status === 'published' ? now : null,
    },
  });

  if (tagIds && tagIds.length) {
    await prisma.postTag.createMany({ data: tagIds.map((tid: number) => ({ postId: post.id, tagId: tid })) });
  }

  const revCount = await prisma.postRevision.count({ where: { postId: post.id } });
  await prisma.postRevision.create({
    data: {
      postId: post.id, userId, title, excerpt: excerpt ?? null,
      content: content ?? null, featuredImage: featuredImage ?? null,
      revisionNumber: revCount + 1,
    },
  });

  const full = await prisma.post.findUnique({ where: { id: post.id }, include: postInclude });
  return NextResponse.json({ success: true, message: 'Post created', data: shapePost(full!) }, { status: 201 });
}
