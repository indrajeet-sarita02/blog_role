import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Post, User, Category, Tag } from '@/database/seeders';

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
  const q = (params.get('q') || '').toLowerCase();
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '10'), 100);
  if (!q) {
    return NextResponse.json({ success: true, message: 'Search results', data: [], meta: { page, limit, total: 0, totalPages: 0 } });
  }
  const all = await Post.findAll({ where: { status: 'published', visibility: 'public' }, include });
  const filtered = all.filter((p) => p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q) || (p.content || '').toLowerCase().includes(q));
  const total = filtered.length;
  const start = (page - 1) * limit;
  return NextResponse.json({
    success: true, message: 'Search results', data: filtered.slice(start, start + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
