import { Post, Category, Tag } from '@database/index';
import { AppError } from '@utils/AppError';
import { parsePagination } from '@utils/pagination';
import { POST_STATUS, POST_VISIBILITY } from '@config/constants';
import { Op, WhereOptions } from 'sequelize';

const PUBLIC_WHERE = {
  status: POST_STATUS.PUBLISHED,
  visibility: POST_VISIBILITY.PUBLIC,
};

const POST_INCLUDE = [
  { model: Tag, as: 'tags', through: { attributes: [] }, attributes: ['id', 'name', 'slug'] },
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
];

export async function listPublicPosts(filters: {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  tag?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const where: WhereOptions<Post> = { ...PUBLIC_WHERE };

  if (filters.search) {
    where[Op.or as never] = [
      { title: { [Op.like]: `%${filters.search}%` } },
      { excerpt: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  if (filters.category) {
    const category = await Category.findOne({ where: { slug: filters.category } });
    if (category) {
      where.categoryId = category.id;
    }
  }

  const tagInclude = filters.tag
    ? { model: Tag, as: 'tags', where: { slug: filters.tag }, required: true, through: { attributes: [] } }
    : { model: Tag, as: 'tags', through: { attributes: [] }, attributes: ['id', 'name', 'slug'] };

  const { rows, count } = await Post.findAndCountAll({
    where,
    include: [
      tagInclude,
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
    ],
    limit,
    offset,
    order: [[sort, order]],
    distinct: true,
  });

  return {
    posts: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function getPublicPostBySlug(slug: string) {
  const post = await Post.findOne({
    where: { slug, ...PUBLIC_WHERE },
    include: POST_INCLUDE,
  });
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  return post;
}

export async function listPublicCategories(filters: { page?: string; limit?: string; search?: string; sort?: string; order?: 'asc' | 'desc' }) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const where: WhereOptions<Category> = { status: 'active' };
  if (filters.search) {
    where[Op.or as never] = [{ name: { [Op.like]: `%${filters.search}%` } }];
  }

  const { rows, count } = await Category.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    distinct: true,
  });

  return {
    categories: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function getPublicCategoryBySlug(slug: string) {
  const category = await Category.findOne({ where: { slug, status: 'active' } });
  if (!category) {
    throw AppError.notFound('Category not found');
  }
  return category;
}

export async function listPublicTags(filters: { page?: string; limit?: string; search?: string; sort?: string; order?: 'asc' | 'desc' }) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const where: WhereOptions<Tag> = {};
  if (filters.search) {
    where[Op.or as never] = [{ name: { [Op.like]: `%${filters.search}%` } }];
  }

  const { rows, count } = await Tag.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    distinct: true,
  });

  return {
    tags: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function getPublicTagBySlug(slug: string) {
  const tag = await Tag.findOne({ where: { slug } });
  if (!tag) {
    throw AppError.notFound('Tag not found');
  }
  return tag;
}

export async function searchPublic(query: string, filters: { page?: string; limit?: string }) {
  const { page, limit, offset } = parsePagination(filters);

  const where: WhereOptions<Post> = {
    ...PUBLIC_WHERE,
    [Op.or as never]: [
      { title: { [Op.like]: `%${query}%` } },
      { excerpt: { [Op.like]: `%${query}%` } },
      { content: { [Op.like]: `%${query}%` } },
    ],
  };

  const { rows, count } = await Post.findAndCountAll({
    where,
    limit,
    offset,
    include: POST_INCLUDE,
    order: [['published_at', 'DESC']],
    distinct: true,
  });

  return {
    posts: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}
