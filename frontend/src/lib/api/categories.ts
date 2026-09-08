import { apiRequest } from '@/lib/api/client';
import { ApiListResponse, Category } from '@/types';

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: number | null;
  status?: string;
}

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function fetchCategoryList(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Category[]>>(`/api/categories${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Category>;
}

export async function fetchCategory(id: number) {
  const res = await apiRequest<ApiBody<Category>>(`/api/categories/${id}`);
  return res.data;
}

export async function createCategory(payload: CategoryPayload) {
  const res = await apiRequest<ApiBody<Category>>('/api/categories', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function updateCategory(id: number, payload: Partial<CategoryPayload>) {
  const res = await apiRequest<ApiBody<Category>>(`/api/categories/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return res.data;
}

export async function deleteCategory(id: number) {
  await apiRequest(`/api/categories/${id}`, { method: 'DELETE' });
}
