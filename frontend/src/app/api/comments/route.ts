import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Comment, User } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';

const include = [{ model: User, as: 'user' }];

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const postId = params.get('postId');
  const status = params.get('status');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);

  const where: Record<string, unknown> = {};
  if (postId) where.postId = parseInt(postId);
  if (status) where.status = status;

  const { count, rows } = await Comment.findAndCountAll({ where, include, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
  return NextResponse.json({
    success: true, message: 'Comments fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}
