import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { memberUserSelect } from '@/database/shapes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const module = params.get('module');
  const action = params.get('action');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);

  const where: Record<string, unknown> = {};
  if (module) where.module = module;
  if (action) where.action = action;

  const [count, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { user: { select: memberUserSelect } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);
  return NextResponse.json({
    success: true, message: 'Audit logs fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}
