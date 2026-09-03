import { Comment, Post, User, Notification } from '@database/index';
import { AppError } from '@utils/AppError';
import { parsePagination } from '@utils/pagination';
import { COMMENT_STATUS } from '@config/constants';
import { resolveUserPermissions } from '@utils/permissions';
import { writeAuditLog } from '@utils/audit';
import { Op, WhereOptions } from 'sequelize';

const COMMENT_INCLUDE = [
  { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
];

export async function createComment(postId: number, actorId: string, data: { content: string; parentId?: number | null }) {
  const post = await Post.findByPk(postId);
  if (!post) {
    throw AppError.notFound('Post not found');
  }

  if (data.parentId) {
    const parent = await Comment.findByPk(data.parentId);
    if (!parent) {
      throw AppError.badRequest('Parent comment does not exist');
    }
    if (parent.postId !== postId) {
      throw AppError.badRequest('Parent comment belongs to a different post');
    }
  }

  const comment = await Comment.create({
    postId,
    userId: Number(actorId),
    parentId: data.parentId ?? null,
    content: data.content,
    status: COMMENT_STATUS.PENDING,
  });

  await writeAuditLog({
    actorId: Number(actorId),
    action: 'COMMENT_CREATED',
    module: 'comment',
    entityType: 'comment',
    entityId: comment.id,
    newValues: { postId, parentId: data.parentId ?? null },
  });

  if (post.authorId !== Number(actorId)) {
    await Notification.create({
      userId: post.authorId,
      type: 'comment',
      title: 'New comment on your post',
      message: `A new comment was posted on "${post.title}"`,
      data: { postId, commentId: comment.id },
    });
  }

  return getCommentOrThrow(comment.id);
}

export async function getCommentOrThrow(id: number) {
  const comment = await Comment.findByPk(id, { include: COMMENT_INCLUDE });
  if (!comment) {
    throw AppError.notFound('Comment not found');
  }
  return comment;
}

export async function listCommentsByPost(postId: number, actorId: string, filters: {
  page?: string;
  limit?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { page, limit, offset, sort, order } = parsePagination(filters);
  const actor = await resolveUserPermissions(actorId);
  const canViewAny = actor.permissions.has('comment.viewAny');

  const post = await Post.findByPk(postId);
  if (!post) {
    throw AppError.notFound('Post not found');
  }

  const where: WhereOptions<Comment> = { postId };
  if (canViewAny) {
    if (filters.status) {
      where.status = filters.status;
    }
  } else {
    where[Op.or as never] = [
      { status: COMMENT_STATUS.APPROVED },
      { userId: Number(actorId) },
    ];
  }

  const { rows, count } = await Comment.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    include: COMMENT_INCLUDE,
    distinct: true,
  });

  return {
    comments: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function listAllComments(actorId: string, filters: {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { page, limit, offset, sort, order } = parsePagination(filters);
  const actor = await resolveUserPermissions(actorId);
  const canViewAny = actor.permissions.has('comment.viewAny');

  const where: WhereOptions<Comment> = {};
  if (canViewAny) {
    if (filters.status) {
      where.status = filters.status;
    }
  } else {
    where[Op.or as never] = [
      { status: COMMENT_STATUS.APPROVED },
      { userId: Number(actorId) },
    ];
  }
  if (filters.search) {
    where.content = { [Op.like]: `%${filters.search}%` };
  }

  const { rows, count } = await Comment.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    include: [{ model: Post, as: 'post', attributes: ['id', 'title', 'slug'] }, ...COMMENT_INCLUDE],
    distinct: true,
  });

  return {
    comments: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function updateComment(id: number, actorId: string, content: string) {
  const comment = await getCommentOrThrow(id);
  const actor = await resolveUserPermissions(actorId);

  const ownsComment = comment.userId === Number(actorId);
  const canUpdateAny = actor.permissions.has('comment.updateAny');
  const canUpdateOwn = actor.permissions.has('comment.update') && ownsComment;

  if (!canUpdateAny && !canUpdateOwn) {
    throw AppError.forbidden();
  }

  comment.content = content;
  await comment.save();
  await writeAuditLog({
    actorId: Number(actorId),
    action: 'COMMENT_UPDATED',
    module: 'comment',
    entityType: 'comment',
    entityId: id,
    newValues: { content },
  });
  return comment;
}

export async function deleteComment(id: number, actorId: string) {
  const comment = await getCommentOrThrow(id);
  const actor = await resolveUserPermissions(actorId);

  const ownsComment = comment.userId === Number(actorId);
  const canDeleteAny = actor.permissions.has('comment.deleteAny');
  const canDeleteOwn = actor.permissions.has('comment.delete') && ownsComment;

  if (!canDeleteAny && !canDeleteOwn) {
    throw AppError.forbidden();
  }

  await comment.destroy();
  await writeAuditLog({
    actorId: Number(actorId),
    action: 'COMMENT_DELETED',
    module: 'comment',
    entityType: 'comment',
    entityId: id,
    oldValues: { content: comment.content },
  });
}

export async function moderateComment(id: number, actorId: string, targetStatus: string, permission: string) {
  const comment = await getCommentOrThrow(id);
  const actor = await resolveUserPermissions(actorId);

  if (!actor.permissions.has(permission)) {
    throw AppError.forbidden();
  }

  const oldStatus = comment.status;
  comment.status = targetStatus;
  await comment.save();
  await writeAuditLog({
    actorId: Number(actorId),
    action: targetStatus === COMMENT_STATUS.APPROVED ? 'COMMENT_APPROVED' : 'COMMENT_REJECTED',
    module: 'comment',
    entityType: 'comment',
    entityId: id,
    oldValues: { status: oldStatus },
    newValues: { status: targetStatus },
  });
  return comment;
}
