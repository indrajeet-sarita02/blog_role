import { Tag } from '@database/index';
import { AppError } from '@utils/AppError';
import { slugify } from '@utils/slug';
import { parsePagination } from '@utils/pagination';
import { Op, WhereOptions } from 'sequelize';

interface TagFilters {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function listTags(filters: TagFilters) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const searchCondition: WhereOptions<Tag>[] = [];
  if (filters.search) {
    searchCondition.push({ name: { [Op.like]: `%${filters.search}%` } });
  }
  const where: WhereOptions<Tag> = {
    ...(searchCondition.length ? { [Op.or]: searchCondition } : {}),
  };

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

export async function getTagById(id: number) {
  const tag = await Tag.findByPk(id);
  if (!tag) {
    throw AppError.notFound('Tag not found');
  }
  return tag;
}

export async function createTag(data: { name: string; slug?: string }) {
  const slug = data.slug || slugify(data.name);
  const existing = await Tag.findOne({ where: { slug } });
  if (existing) {
    throw AppError.conflict('Tag with this slug already exists');
  }
  const tag = await Tag.create({ name: data.name, slug });
  return tag;
}

export async function updateTag(id: number, data: { name?: string }) {
  const tag = await Tag.findByPk(id);
  if (!tag) {
    throw AppError.notFound('Tag not found');
  }
  if (data.name) {
    tag.name = data.name;
    tag.slug = slugify(data.name);
    await tag.save();
  }
  return tag;
}

export async function deleteTag(id: number) {
  const tag = await Tag.findByPk(id);
  if (!tag) {
    throw AppError.notFound('Tag not found');
  }
  await tag.destroy();
}
