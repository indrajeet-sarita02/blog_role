import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { memberUserSelect } from '@/database/shapes';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const postId = params.get('postId');
  const status = params.get('status');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);

  const where: Record<string, unknown> = { deletedAt: null };
  if (postId) where.postId = parseInt(postId);
  if (status) where.status = status;

  const [count, rows] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      include: { user: { select: memberUserSelect } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);
  return NextResponse.json({
    success: true, message: 'Comments fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}
