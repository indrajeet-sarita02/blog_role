import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Tag } from '@/database/seeders';

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
    const all = await Tag.findAll();
    const filtered = all.filter((t) => t.name.toLowerCase().includes(s));
    return NextResponse.json({
      success: true, message: 'Tags fetched', data: filtered,
      meta: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    });
  }

  const { count, rows } = await Tag.findAndCountAll({ limit, offset: (page - 1) * limit, order: [['name', 'ASC']] });
  return NextResponse.json({
    success: true, message: 'Tags fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const { name } = body;
  if (!name) {
    return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const existing = await Tag.findOne({ where: { slug } });
  if (existing) {
    return NextResponse.json({ success: false, message: 'Tag slug already exists' }, { status: 409 });
  }
  const tag = await Tag.create({ name, slug });
  return NextResponse.json({ success: true, message: 'Tag created', data: tag }, { status: 201 });
}
