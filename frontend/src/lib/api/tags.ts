import { api } from './client';
import { ApiListResponse, ApiResponse, Tag } from '@/types';

export async function fetchTags(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Tag>>('/tags', { params });
  return data;
}

export async function fetchTag(id: number) {
  const { data } = await api.get<ApiResponse<Tag>>(`/tags/${id}`);
  return data.data;
}

export async function createTag(payload: { name: string }) {
  const { data } = await api.post<ApiResponse<Tag>>('/tags', payload);
  return data.data;
}

export async function updateTag(id: number, name: string) {
  const { data } = await api.put<ApiResponse<Tag>>(`/tags/${id}`, { name });
  return data.data;
}

export async function deleteTag(id: number) {
  await api.delete(`/tags/${id}`);
}