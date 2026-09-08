import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Post, User, Category, Tag, PostTag } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const include = [
  { model: User, as: 'author' },
  { model: Category, as: 'category' },
  { model: Tag, as: 'tags' },
];

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const category = params.get('category');
  const tag = params.get('tag');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '10'), 100);

  const where: Record<string, unknown> = { status: 'published', visibility: 'public' };

  if (category) {
    const cat = await Category.findOne({ where: { slug: category, status: 'active' } });
    if (cat) where.categoryId = cat.id;
  }
  if (tag) {
    const t = await Tag.findOne({ where: { slug: tag } });
    if (t) {
      const links = await PostTag.findAll({ where: { tagId: t.id } });
      const ids = links.map((l) => l.postId);
      const rows = (await Post.findAll({ where: { id: ids, ...where }, include })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const start = (page - 1) * limit;
      return NextResponse.json({
        success: true, message: 'Posts fetched', data: rows.slice(start, start + limit),
        meta: { page, limit, total: rows.length, totalPages: Math.ceil(rows.length / limit) },
      });
    }
    return NextResponse.json({ success: true, message: 'Posts fetched', data: [], meta: { page, limit, total: 0, totalPages: 0 } });
  }

  const { count, rows } = await Post.findAndCountAll({ where, include, limit, offset: (page - 1) * limit, order: [['publishedAt', 'DESC']] });
  return NextResponse.json({
    success: true, message: 'Posts fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}
