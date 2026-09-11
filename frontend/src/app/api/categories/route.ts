import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { slugify } from '@/lib/utils/slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const search = params.get('search');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);

  if (search) {
    const s = search.toLowerCase();
    const all = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    const filtered = all.filter((c) => c.name.toLowerCase().includes(s));
    const total = filtered.length;
    const start = (page - 1) * limit;
    return NextResponse.json({
      success: true, message: 'Categories fetched', data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  const total = await prisma.category.count();
  const rows = await prisma.category.findMany({
    take: limit, skip: (page - 1) * limit,
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({
    success: true, message: 'Categories fetched', data: rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
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
  const existing = await prisma.category.findFirst({ where: { slug: finalSlug } });
  if (existing) {
    return NextResponse.json({ success: false, message: 'Category slug already exists' }, { status: 409 });
  }
  const cat = await prisma.category.create({
    data: {
      name, slug: finalSlug, description: description ?? null,
      parentId: parentId ?? null, status: status || 'active',
    },
  });
  return NextResponse.json({ success: true, message: 'Category created', data: cat }, { status: 201 });
}
