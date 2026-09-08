import { apiRequest } from '@/lib/api/client';
import { ApiListResponse, Tag } from '@/types';

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function fetchTags(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Tag[]>>(`/api/tags${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Tag>;
}

export async function fetchTag(id: number) {
  const res = await apiRequest<ApiBody<Tag>>(`/api/tags/${id}`);
  return res.data;
}

export async function createTag(payload: { name: string }) {
  const res = await apiRequest<ApiBody<Tag>>('/api/tags', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function updateTag(id: number, name: string) {
  const res = await apiRequest<ApiBody<Tag>>(`/api/tags/${id}`, {
    method: 'PUT',
    body: { name },
  });
  return res.data;
}

export async function deleteTag(id: number) {
  await apiRequest(`/api/tags/${id}`, { method: 'DELETE' });
}
