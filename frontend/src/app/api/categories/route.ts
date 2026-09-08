import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Category } from '@/database/seeders';
import { slugify } from '@/lib/utils/slug';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const search = params.get('search');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);

  const where: Record<string, unknown> = {};
  if (search) {
    const s = search.toLowerCase();
    const all = await Category.findAll();
    const filtered = all.filter((c) => c.name.toLowerCase().includes(s));
    const total = filtered.length;
    const start = (page - 1) * limit;
    return NextResponse.json({
      success: true, message: 'Categories fetched', data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  const { count, rows } = await Category.findAndCountAll({ where, limit, offset: (page - 1) * limit, order: [['name', 'ASC']] });
  return NextResponse.json({
    success: true, message: 'Categories fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const { name, slug, description, parentId, status } = body;
  if (!name) {
    return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
  }
  const finalSlug = slug || slugify(name);
  const existing = await Category.findOne({ where: { slug: finalSlug } });
  if (existing) {
    return NextResponse.json({ success: false, message: 'Category slug already exists' }, { status: 409 });
  }
  const cat = await Category.create({
    name, slug: finalSlug, description: description ?? null,
    parentId: parentId ?? null, status: status || 'active',
  });
  return NextResponse.json({ success: true, message: 'Category created', data: cat }, { status: 201 });
}
