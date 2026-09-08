import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Comment, User } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';

const include = [{ model: User, as: 'user' }];

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
  await ensureDb();
  const postId = parseInt(params.postId);
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 100);
  const { count, rows } = await Comment.findAndCountAll({
    where: { postId }, include, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']],
  });
  return NextResponse.json({
    success: true, message: 'Comments fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { content, parentId } = body;
  if (!content) {
    return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 });
  }
  const comment = await Comment.create({
    postId: parseInt(params.postId), userId, parentId: parentId ?? null,
    content, status: 'approved',
  });
  const full = await Comment.findByPk(comment.id, { include });
  return NextResponse.json({ success: true, message: 'Comment created', data: full }, { status: 201 });
}
