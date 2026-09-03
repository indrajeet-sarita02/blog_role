import { AuditLog } from '@database/index';
import { AppError } from '@utils/AppError';
import { parsePagination } from '@utils/pagination';
import { Op, WhereOptions } from 'sequelize';

export async function listAuditLogs(filters: {
  page?: string;
  limit?: string;
  action?: string;
  module?: string;
  userId?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const where: WhereOptions<AuditLog> = {};
  if (filters.action) {
    where.action = filters.action;
  }
  if (filters.module) {
    where.module = filters.module;
  }
  if (filters.userId) {
    where.userId = Number(filters.userId);
  }
  if (filters.search) {
    where[Op.or as never] = [
      { action: { [Op.like]: `%${filters.search}%` } },
      { entityType: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  const { rows, count } = await AuditLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    distinct: true,
  });

  return {
    logs: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function getAuditLog(id: number) {
  const log = await AuditLog.findByPk(id);
  if (!log) {
    throw AppError.notFound('Audit log not found');
  }
  return log;
}