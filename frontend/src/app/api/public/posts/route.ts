import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { shapePost, memberUserSelect } from '@/database/shapes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const include = {
  author: { select: memberUserSelect },
  category: true,
  tags: { include: { tag: true } },
};

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const category = params.get('category');
  const tag = params.get('tag');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '10'), 100);

  const where: Record<string, unknown> = { status: 'published', visibility: 'public', deletedAt: null };

  if (category) {
    const cat = await prisma.category.findFirst({ where: { slug: category, status: 'active' } });
    if (cat) where.categoryId = cat.id;
  }
  if (tag) {
    const t = await prisma.tag.findFirst({ where: { slug: tag } });
    if (t) {
      const links = await prisma.postTag.findMany({ where: { tagId: t.id } });
      const ids = links.map((l) => l.postId);
      const rows = (await prisma.post.findMany({ where: { id: { in: ids }, ...where }, include })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const start = (page - 1) * limit;
      return NextResponse.json({
        success: true, message: 'Posts fetched', data: rows.slice(start, start + limit).map(shapePost),
        meta: { page, limit, total: rows.length, totalPages: Math.ceil(rows.length / limit) },
      });
    }
    return NextResponse.json({ success: true, message: 'Posts fetched', data: [], meta: { page, limit, total: 0, totalPages: 0 } });
  }

  const [count, rows] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({ where, include, orderBy: { publishedAt: 'desc' }, take: limit, skip: (page - 1) * limit }),
  ]);
  return NextResponse.json({
    success: true, message: 'Posts fetched', data: rows.map(shapePost),
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}
