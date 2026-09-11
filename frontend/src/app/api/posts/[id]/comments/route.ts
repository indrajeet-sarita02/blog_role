import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { memberUserSelect } from '@/database/shapes';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const commentInclude = { user: { select: memberUserSelect } };

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const postId = parseInt(params.id);
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 100);
  const where = { postId, deletedAt: null };
  const [count, rows] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({ where, include: commentInclude, take: limit, skip: (page - 1) * limit, orderBy: { createdAt: 'desc' } }),
  ]);
  return NextResponse.json({
    success: true, message: 'Comments fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
  const comment = await prisma.comment.create({
    data: {
      postId: parseInt(params.id), userId, parentId: parentId ?? null,
      content, status: 'approved',
    },
  });
  const full = await prisma.comment.findUnique({ where: { id: comment.id }, include: commentInclude });
  return NextResponse.json({ success: true, message: 'Comment created', data: full }, { status: 201 });
}
