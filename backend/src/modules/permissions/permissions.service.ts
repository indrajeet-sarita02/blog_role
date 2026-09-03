import { Permission } from '@database/index';
import { AppError } from '@utils/AppError';
import { parsePagination } from '@utils/pagination';
import { Op, WhereOptions } from 'sequelize';

export async function listPermissions(filters: {
  page?: string;
  limit?: string;
  module?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const searchCondition: WhereOptions<Permission>[] = [];
  if (filters.search) {
    searchCondition.push(
      { name: { [Op.like]: `%${filters.search}%` } },
      { slug: { [Op.like]: `%${filters.search}%` } },
    );
  }
  const where: WhereOptions<Permission> = {
    ...(filters.module ? { module: filters.module } : {}),
    ...(searchCondition.length ? { [Op.or]: searchCondition } : {}),
  };

  const { rows, count } = await Permission.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    distinct: true,
  });

  return {
    permissions: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function getPermissionById(id: number) {
  const permission = await Permission.findByPk(id);
  if (!permission) {
    throw AppError.notFound('Permission not found');
  }
  return permission;
}
