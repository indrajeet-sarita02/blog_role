import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Post, User, Category, Tag, PostTag, PostRevision, sequelize } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';
import { slugify } from '@/lib/utils/slug';

export const runtime = 'nodejs';

const include = [
  { model: User, as: 'author' },
  { model: Category, as: 'category' },
  { model: Tag, as: 'tags' },
];

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const authorId = params.get('authorId');
  const status = params.get('status');
  const search = params.get('search');

  const where: Record<string, unknown> = {};
  if (authorId) where.authorId = parseInt(authorId);
  if (status) where.status = status;
  if (search) {
    const s = search.toLowerCase();
    const all = await Post.findAll({ where, include });
    const filtered = all.filter((p) => p.title.toLowerCase().includes(s) || (p.excerpt || '').toLowerCase().includes(s));
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ success: true, message: 'Posts fetched', data: filtered, meta: { page: 1, limit: filtered.length, total: filtered.length, totalPages: 1 } });
  }

  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);
  const { count, rows } = await Post.findAndCountAll({ where, include, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });

  return NextResponse.json({
    success: true, message: 'Posts fetched', data: rows,
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

  const created = await sequelize.transaction(async (t) => {
    const finalSlug = slug || slugify(title);
    const now = new Date();
    const post = await Post.create({
      authorId: userId, categoryId: categoryId ?? null, title,
      slug: finalSlug, excerpt: excerpt ?? null, content: content ?? null,
      featuredImage: featuredImage ?? null, status: status || 'draft',
      visibility: visibility || 'public',
      publishedAt: status === 'published' ? now : null,
      createdAt: now, updatedAt: now,
    }, { transaction: t });

    if (tagIds && tagIds.length) {
      await PostTag.bulkCreate(tagIds.map((tid: number) => ({ postId: post.id, tagId: tid })), { transaction: t });
    }

    const revCount = await PostRevision.count({ where: { postId: post.id }, transaction: t });
    await PostRevision.create({
      postId: post.id, userId, title, excerpt: excerpt ?? null,
      content: content ?? null, featuredImage: featuredImage ?? null,
      revisionNumber: revCount + 1, createdAt: now,
    }, { transaction: t });

    return post;
  });

  const full = await Post.findOne({ where: { id: created.id }, include });
  return NextResponse.json({ success: true, message: 'Post created', data: full }, { status: 201 });
}
