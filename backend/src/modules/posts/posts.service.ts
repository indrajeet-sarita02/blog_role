import { Post, PostTag, PostRevision, Category, Tag, sequelize } from '@database/index';
import { AppError } from '@utils/AppError';
import { slugify } from '@utils/slug';
import { parsePagination } from '@utils/pagination';
import { POST_STATUS, POST_VISIBILITY } from '@config/constants';
import { resolveUserPermissions } from '@utils/permissions';
import { writeAuditLog } from '@utils/audit';
import { Op, WhereOptions } from 'sequelize';

interface PostFilters {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  categoryId?: string;
  authorId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PostData {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  categoryId?: number | null;
  tagIds?: number[];
  visibility?: string;
}

async function getPrivilegedPost(id: number) {
  const post = await Post.findByPk(id, {
    include: [
      { model: Tag, as: 'tags', through: { attributes: [] }, attributes: ['id', 'name', 'slug'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
    ],
  });
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  return post;
}

export async function listPosts(filters: PostFilters, actorId: string) {
  const { page, limit, offset, sort, order } = parsePagination(filters);
  const actor = await resolveUserPermissions(actorId);
  const canViewAny = actor.permissions.has('blog.viewAny');

  const searchCondition: WhereOptions<Post>[] = [];
  if (filters.search) {
    searchCondition.push(
      { title: { [Op.like]: `%${filters.search}%` } },
      { slug: { [Op.like]: `%${filters.search}%` } },
    );
  }

  const whereObj: WhereOptions<Post> = {
    ...(filters.categoryId ? { categoryId: Number(filters.categoryId) } : {}),
    ...(filters.authorId ? { authorId: Number(filters.authorId) } : {}),
    ...(searchCondition.length ? { [Op.or]: searchCondition } : {}),
  };

  if (canViewAny) {
    if (filters.status) {
      whereObj.status = filters.status;
    }
  } else {
    whereObj[Op.or as never] = [
      { status: POST_STATUS.PUBLISHED, visibility: POST_VISIBILITY.PUBLIC },
      { authorId: Number(actorId) },
    ];
  }

  const { rows, count } = await Post.findAndCountAll({
    where: whereObj,
    limit,
    offset,
    order: [[sort, order]],
    include: [
      { model: Tag, as: 'tags', through: { attributes: [] }, attributes: ['id', 'name', 'slug'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
    ],
    distinct: true,
  });

  return {
    posts: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function getPost(id: number, actorId: string) {
  const post = await getPrivilegedPost(id);
  const actor = await resolveUserPermissions(actorId);
  const canViewAny = actor.permissions.has('blog.viewAny');

  const isVisible =
    (post.status === POST_STATUS.PUBLISHED && post.visibility === POST_VISIBILITY.PUBLIC) ||
    canViewAny ||
    post.authorId === Number(actorId);

  if (!isVisible) {
    throw AppError.forbidden('You do not have permission to view this post');
  }

  return post;
}

async function ensureUniqueSlug(slug: string, excludeId?: number) {
  const where: WhereOptions<Post> = { slug };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId } as never;
  }
  const existing = await Post.findOne({ where });
  if (existing) {
    throw AppError.conflict('Post with this slug already exists');
  }
}

async function createRevision(post: Post, userId: number) {
  const last = await PostRevision.findOne({
    where: { postId: post.id },
    order: [['revision_number', 'DESC']],
    attributes: ['revisionNumber'],
  });
  const revisionNumber = last ? last.revisionNumber + 1 : 1;

  await PostRevision.create({
    postId: post.id,
    userId,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage,
    revisionNumber,
  });
}

async function syncTags(postId: number, tagIds: number[] = []) {
  await PostTag.destroy({ where: { postId } });
  if (tagIds.length) {
    await PostTag.bulkCreate(tagIds.map((tagId) => ({ postId, tagId })));
  }
}

export async function createPost(data: PostData & { status?: string }, actorId: string) {
  const actor = await resolveUserPermissions(actorId);
  if (!actor.permissions.has('blog.create')) {
    throw AppError.forbidden();
  }

  const slug = data.slug || slugify(data.title || '');
  await ensureUniqueSlug(slug);

  if (data.categoryId) {
    const category = await Category.findByPk(data.categoryId);
    if (!category) {
      throw AppError.badRequest('Category does not exist');
    }
  }

  if (data.tagIds?.length) {
    const tags = await Tag.findAll({ where: { id: { [Op.in]: data.tagIds } } });
    if (tags.length !== data.tagIds.length) {
      throw AppError.badRequest('One or more tags do not exist');
    }
  }

  const status = data.status ?? POST_STATUS.DRAFT;

  const post = await sequelize.transaction(async (transaction) => {
    const created = await Post.create(
      {
        authorId: Number(actorId),
        title: data.title!,
        slug,
        excerpt: data.excerpt ?? null,
        content: data.content ?? null,
        featuredImage: data.featuredImage ?? null,
        categoryId: data.categoryId ?? null,
        status,
        visibility: data.visibility ?? POST_VISIBILITY.PUBLIC,
      },
      { transaction },
    );

    await syncTags(created.id, data.tagIds);

    if (status === POST_STATUS.PENDING_REVIEW) {
      await createRevision(created, Number(actorId));
    }
    await writeAuditLog(
      {
        actorId: Number(actorId),
        action: 'POST_CREATED',
        module: 'post',
        entityType: 'post',
        entityId: created.id,
        newValues: { title: created.title, slug, status },
      },
      transaction,
    );
    return created;
  });

  return getPrivilegedPost(post.id);
}

export async function updatePost(id: number, data: PostData, actorId: string) {
  const post = await getPrivilegedPost(id);
  const actor = await resolveUserPermissions(actorId);

  const ownsPost = post.authorId === Number(actorId);
  const canUpdateAny = actor.permissions.has('blog.updateAny');
  const canUpdateOwn = actor.permissions.has('blog.update') && ownsPost;

  if (!canUpdateAny && !canUpdateOwn) {
    throw AppError.forbidden();
  }

  const oldValues = {
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage,
    visibility: post.visibility,
  };

  if (data.slug || data.title) {
    const newSlug = data.slug || slugify(data.title || post.title);
    await ensureUniqueSlug(newSlug, id);
    post.slug = newSlug;
  }

  if (data.title) post.title = data.title;
  if (data.excerpt !== undefined) post.excerpt = data.excerpt;
  if (data.content !== undefined) post.content = data.content;
  if (data.featuredImage !== undefined) post.featuredImage = data.featuredImage;
  if (data.visibility) post.visibility = data.visibility;

  if (data.categoryId !== undefined) {
    if (data.categoryId != null) {
      const category = await Category.findByPk(data.categoryId);
      if (!category) {
        throw AppError.badRequest('Category does not exist');
      }
    }
    post.categoryId = data.categoryId;
  }

  await sequelize.transaction(async (transaction) => {
    await post.save({ transaction });
    await syncTags(post.id, data.tagIds);
    await createRevision(post, Number(actorId));
    await writeAuditLog(
      {
        actorId: Number(actorId),
        action: 'POST_UPDATED',
        module: 'post',
        entityType: 'post',
        entityId: id,
        oldValues,
        newValues: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          featuredImage: post.featuredImage,
          visibility: post.visibility,
        },
      },
      transaction,
    );
  });

  return getPrivilegedPost(id);
}

export async function deletePost(id: number, actorId: string) {
  const post = await getPrivilegedPost(id);
  const actor = await resolveUserPermissions(actorId);

  const ownsPost = post.authorId === Number(actorId);
  const canDeleteAny = actor.permissions.has('blog.deleteAny');
  const canDeleteOwn = actor.permissions.has('blog.delete') && ownsPost;

  if (!canDeleteAny && !canDeleteOwn) {
    throw AppError.forbidden();
  }

  await sequelize.transaction(async (transaction) => {
    await PostTag.destroy({ where: { postId: id }, transaction });
    await post.destroy({ transaction });
    await writeAuditLog(
      {
        actorId: Number(actorId),
        action: 'POST_DELETED',
        module: 'post',
        entityType: 'post',
        entityId: id,
        oldValues: { title: post.title, slug: post.slug },
      },
      transaction,
    );
  });
}

export async function changePostStatus(id: number, actorId: string, targetStatus: string, permission: string) {
  const post = await getPrivilegedPost(id);
  const actor = await resolveUserPermissions(actorId);

  if (!actor.permissions.has(permission)) {
    throw AppError.forbidden();
  }

  const oldStatus = post.status;
  post.status = targetStatus;
  if (targetStatus === POST_STATUS.PUBLISHED) {
    post.publishedAt = new Date();
  }
  await post.save();

  await writeAuditLog({
    actorId: Number(actorId),
    action: targetStatus === POST_STATUS.PUBLISHED ? 'POST_PUBLISHED' : `POST_${targetStatus.toUpperCase()}`,
    module: 'post',
    entityType: 'post',
    entityId: id,
    oldValues: { status: oldStatus },
    newValues: { status: targetStatus },
  });

  return post;
}

export async function submitForReview(id: number, actorId: string) {
  const post = await getPrivilegedPost(id);
  const actor = await resolveUserPermissions(actorId);

  const ownsPost = post.authorId === Number(actorId);
  const canUpdateAny = actor.permissions.has('blog.updateAny');
  const canUpdateOwn = actor.permissions.has('blog.update') && ownsPost;

  if (!canUpdateAny && !canUpdateOwn) {
    throw AppError.forbidden();
  }

  await sequelize.transaction(async (transaction) => {
    post.status = POST_STATUS.PENDING_REVIEW;
    await post.save({ transaction });
    await createRevision(post, Number(actorId));
    await writeAuditLog(
      {
        actorId: Number(actorId),
        action: 'POST_SUBMITTED_FOR_REVIEW',
        module: 'post',
        entityType: 'post',
        entityId: id,
        newValues: { status: POST_STATUS.PENDING_REVIEW },
      },
      transaction,
    );
  });
  return post;
}

export async function listRevisions(postId: number, actorId: string) {
  await getPost(postId, actorId);
  const revisions = await PostRevision.findAll({
    where: { postId },
    order: [['revision_number', 'DESC']],
  });
  return revisions;
}

export async function getRevision(postId: number, revisionId: number, actorId: string) {
  await getPost(postId, actorId);
  const revision = await PostRevision.findOne({ where: { postId, id: revisionId } });
  if (!revision) {
    throw AppError.notFound('Revision not found');
  }
  return revision;
}

export async function restoreRevision(postId: number, revisionId: number, actorId: string) {
  const post = await getPrivilegedPost(postId);
  const actor = await resolveUserPermissions(actorId);

  const ownsPost = post.authorId === Number(actorId);
  const canUpdateAny = actor.permissions.has('blog.updateAny');
  const canUpdateOwn = actor.permissions.has('blog.update') && ownsPost;
  if (!canUpdateAny && !canUpdateOwn) {
    throw AppError.forbidden();
  }

  const revision = await PostRevision.findOne({ where: { postId, id: revisionId } });
  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  await sequelize.transaction(async (transaction) => {
    post.title = revision.title;
    post.excerpt = revision.excerpt;
    post.content = revision.content;
    post.featuredImage = revision.featuredImage;
    await post.save({ transaction });
    await createRevision(post, Number(actorId));
    await writeAuditLog(
      {
        actorId: Number(actorId),
        action: 'POST_REVISION_RESTORED',
        module: 'post',
        entityType: 'post',
        entityId: postId,
        newValues: { revisionId: revision.id, revisionNumber: revision.revisionNumber },
      },
      transaction,
    );
  });

  return getPrivilegedPost(postId);
}
