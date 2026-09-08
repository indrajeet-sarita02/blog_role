import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Tag } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const search = params.get('search');
  const limit = Math.min(parseInt(params.get('limit') || '100'), 100);
  if (search) {
    const s = search.toLowerCase();
    const all = await Tag.findAll();
    const filtered = all.filter((t) => t.name.toLowerCase().includes(s));
    return NextResponse.json({ success: true, message: 'Tags fetched', data: filtered, meta: { page: 1, limit, total: filtered.length, totalPages: 1 } });
  }
  const rows = await Tag.findAll({ order: [['name', 'ASC']] });
  return NextResponse.json({ success: true, message: 'Tags fetched', data: rows, meta: { page: 1, limit, total: rows.length, totalPages: 1 } });
}
