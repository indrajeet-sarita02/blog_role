import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

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

  const total = await prisma.permission.count({ where });
  const rows = await prisma.permission.findMany({
    where, take: limit, skip: (page - 1) * limit,
    orderBy: [{ module: 'asc' }, { id: 'asc' }],
  });

  return NextResponse.json({
    success: true, message: 'Permissions fetched', data: rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
