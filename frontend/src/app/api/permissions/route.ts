import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Permission } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const module = params.get('module');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '100'), 100);

  const where: Record<string, unknown> = {};
  if (module) where.module = module;

  const { count, rows } = await Permission.findAndCountAll({ where, limit, offset: (page - 1) * limit, order: [['module', 'ASC'], ['id', 'ASC']] });

  return NextResponse.json({
    success: true, message: 'Permissions fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}
