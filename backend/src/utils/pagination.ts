import { COMMON } from '@config/constants';

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function parsePagination(query: PaginationParams) {
  const page = Math.max(parseInt(String(query.page || '1'), 10) || 1, 1);
  let limit = parseInt(String(query.limit || String(COMMON.defaultLimit)), 10) || COMMON.defaultLimit;
  limit = Math.min(Math.max(limit, 1), COMMON.maxLimit);
  const offset = (page - 1) * limit;
  const order = (query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  const sort = query.sort || 'created_at';

  return { page, limit, offset, sort, order };
}
