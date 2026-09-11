import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const search = params.get('search');
  const limit = Math.min(parseInt(params.get('limit') || '100'), 100);
  const where: Record<string, unknown> = { status: 'active' };
  if (search) {
    const all = await prisma.category.findMany({ where });
    const filtered = all.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    return NextResponse.json({ success: true, message: 'Categories fetched', data: filtered, meta: { page: 1, limit, total: filtered.length, totalPages: 1 } });
  }
  const rows = await prisma.category.findMany({ where, orderBy: { name: 'asc' } });
  return NextResponse.json({ success: true, message: 'Categories fetched', data: rows, meta: { page: 1, limit, total: rows.length, totalPages: 1 } });
}
