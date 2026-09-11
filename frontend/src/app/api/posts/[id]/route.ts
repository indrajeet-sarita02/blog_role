import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { shapePost, memberUserSelect } from '@/database/shapes';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const postInclude = {
  author: { select: memberUserSelect },
  category: true,
  tags: { include: { tag: true } },
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const post = await prisma.post.findUnique({ where: { id: parseInt(params.id), deletedAt: null }, include: postInclude });
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Post fetched', data: shapePost(post) });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = parseInt(params.id);
  const post = await prisma.post.findUnique({ where: { id, deletedAt: null } });
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.content !== undefined) data.content = body.content;
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;
  if (body.featuredImage !== undefined) data.featuredImage = body.featuredImage;
  if (body.status !== undefined) {
    data.status = body.status;
    if (body.status === 'published' && !post.publishedAt) data.publishedAt = new Date();
  }
  if (body.visibility !== undefined) data.visibility = body.visibility;

  const updated = await prisma.post.update({ where: { id }, data });

  if (Array.isArray(body.tagIds)) {
    await prisma.postTag.deleteMany({ where: { postId: id } });
    if (body.tagIds.length) {
      await prisma.postTag.createMany({ data: body.tagIds.map((tid: number) => ({ postId: id, tagId: tid })) });
    }
  }

  const revCount = await prisma.postRevision.count({ where: { postId: id } });
  await prisma.postRevision.create({
    data: {
      postId: id, userId, title: updated.title, excerpt: updated.excerpt,
      content: updated.content, featuredImage: updated.featuredImage,
      revisionNumber: revCount + 1,
    },
  });

  const full = await prisma.post.findUnique({ where: { id }, include: postInclude });
  return NextResponse.json({ success: true, message: 'Post updated', data: shapePost(full!) });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const id = parseInt(params.id);
  const post = await prisma.post.findUnique({ where: { id, deletedAt: null } });
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  await prisma.comment.deleteMany({ where: { postId: id } });
  await prisma.postTag.deleteMany({ where: { postId: id } });
  await prisma.postRevision.deleteMany({ where: { postId: id } });
  await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true, message: 'Post deleted' });
}
