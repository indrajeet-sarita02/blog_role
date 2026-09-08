import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Post, User, Category, Tag, PostTag, PostRevision, Comment, sequelize } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';

const include = [
  { model: User, as: 'author' },
  { model: Category, as: 'category' },
  { model: Tag, as: 'tags' },
];

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const post = await Post.findOne({ where: { id: parseInt(params.id) }, include });
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Post fetched', data: post });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = parseInt(params.id);
  const post = await Post.findByPk(id);
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }

  if (body.title !== undefined) post.title = body.title;
  if (body.slug !== undefined) post.slug = body.slug;
  if (body.content !== undefined) post.content = body.content;
  if (body.excerpt !== undefined) post.excerpt = body.excerpt;
  if (body.categoryId !== undefined) post.categoryId = body.categoryId;
  if (body.featuredImage !== undefined) post.featuredImage = body.featuredImage;
  if (body.status !== undefined) {
    post.status = body.status;
    if (body.status === 'published' && !post.publishedAt) post.publishedAt = new Date();
  }
  if (body.visibility !== undefined) post.visibility = body.visibility;

  await sequelize.transaction(async (t) => {
    await post.save({ transaction: t });
    if (Array.isArray(body.tagIds)) {
      await PostTag.destroy({ where: { postId: id }, transaction: t });
      if (body.tagIds.length) {
        await PostTag.bulkCreate(body.tagIds.map((tid: number) => ({ postId: id, tagId: tid })), { transaction: t });
      }
    }
    const revCount = await PostRevision.count({ where: { postId: id }, transaction: t });
    await PostRevision.create({
      postId: id, userId, title: post.title, excerpt: post.excerpt,
      content: post.content, featuredImage: post.featuredImage,
      revisionNumber: revCount + 1, createdAt: new Date(),
    }, { transaction: t });
  });

  const full = await Post.findOne({ where: { id }, include });
  return NextResponse.json({ success: true, message: 'Post updated', data: full });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const id = parseInt(params.id);
  const post = await Post.findByPk(id);
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  await sequelize.transaction(async (t) => {
    await Comment.destroy({ where: { postId: id }, force: true, transaction: t });
    await PostTag.destroy({ where: { postId: id }, transaction: t });
    await PostRevision.destroy({ where: { postId: id }, transaction: t });
    await post.destroy({ transaction: t });
  });
  return NextResponse.json({ success: true, message: 'Post deleted' });
}
