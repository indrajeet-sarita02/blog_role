import { Category } from '@database/index';
import { AppError } from '@utils/AppError';
import { slugify } from '@utils/slug';
import { parsePagination } from '@utils/pagination';
import { Op, WhereOptions } from 'sequelize';

interface CategoryFilters {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function listCategories(filters: CategoryFilters) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const searchCondition: WhereOptions<Category>[] = [];
  if (filters.search) {
    searchCondition.push({ name: { [Op.like]: `%${filters.search}%` } });
  }
  const where: WhereOptions<Category> = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(searchCondition.length ? { [Op.or]: searchCondition } : {}),
  };

  const { rows, count } = await Category.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    include: [{ model: Category, as: 'children', attributes: ['id', 'name', 'slug'] }],
    distinct: true,
  });

  return {
    categories: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function getCategoryById(id: number) {
  const category = await Category.findByPk(id, {
    include: [
      { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
      { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] },
    ],
  });
  if (!category) {
    throw AppError.notFound('Category not found');
  }
  return category;
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: number | null;
  status?: string;
}) {
  const slug = data.slug || slugify(data.name);
  const existing = await Category.findOne({ where: { slug } });
  if (existing) {
    throw AppError.conflict('Category with this slug already exists');
  }

  if (data.parentId) {
    const parent = await Category.findByPk(data.parentId);
    if (!parent) {
      throw AppError.badRequest('Parent category does not exist');
    }
  }

  const category = await Category.create({
    name: data.name,
    slug,
    description: data.description ?? null,
    parentId: data.parentId ?? null,
    status: data.status ?? 'active',
  });

  return getCategoryById(category.id);
}

export async function updateCategory(
  id: number,
  data: { name?: string; description?: string | null; parentId?: number | null; status?: string },
) {
  const category = await Category.findByPk(id);
  if (!category) {
    throw AppError.notFound('Category not found');
  }

  if (data.parentId) {
    if (data.parentId === id) {
      throw AppError.badRequest('A category cannot be its own parent');
    }
    const parent = await Category.findByPk(data.parentId);
    if (!parent) {
      throw AppError.badRequest('Parent category does not exist');
    }
  }

  await category.update(data);
  return getCategoryById(id);
}

export async function deleteCategory(id: number) {
  const category = await Category.findByPk(id);
  if (!category) {
    throw AppError.notFound('Category not found');
  }
  const childCount = await Category.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw AppError.conflict('Category has child categories and cannot be deleted');
  }
  await category.destroy();
}
