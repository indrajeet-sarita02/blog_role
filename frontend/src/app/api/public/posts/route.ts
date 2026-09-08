import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Post, User, Category, Tag } from '@/database/seeders';

export const runtime = 'nodejs';

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
      const posts = await t.$get('posts' as never, { where, include });
      const ids = posts.map((p: any) => p.id);
      const rows = (await Post.findAll({ where: { id: ids, ...where }, include })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json({
        success: true, message: 'Posts fetched', data: rows,
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
