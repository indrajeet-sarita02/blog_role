import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Category } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const search = params.get('search');
  const limit = Math.min(parseInt(params.get('limit') || '100'), 100);
  const where: Record<string, unknown> = { status: 'active' };
  if (search) {
    const s = search.toLowerCase();
    const all = await Category.findAll({ where });
    const filtered = all.filter((c) => c.name.toLowerCase().includes(s));
    return NextResponse.json({ success: true, message: 'Categories fetched', data: filtered, meta: { page: 1, limit, total: filtered.length, totalPages: 1 } });
  }
  const rows = await Category.findAll({ where, order: [['name', 'ASC']] });
  return NextResponse.json({ success: true, message: 'Categories fetched', data: rows, meta: { page: 1, limit, total: rows.length, totalPages: 1 } });
}
