import { api } from './client';
import { ApiListResponse, ApiResponse, Category } from '@/types';

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: number | null;
  status?: string;
}

export async function fetchCategoryList(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Category>>('/categories', { params });
  return data;
}

export async function fetchCategory(id: number) {
  const { data } = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  return data.data;
}

export async function createCategory(payload: CategoryPayload) {
  const { data } = await api.post<ApiResponse<Category>>('/categories', payload);
  return data.data;
}

export async function updateCategory(id: number, payload: Partial<CategoryPayload>) {
  const { data } = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`);
}