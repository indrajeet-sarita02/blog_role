import { api } from './client';
import { ApiListResponse, ApiResponse, Media } from '@/types';

export async function fetchMedia(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Media>>('/media', { params });
  return data;
}

export async function uploadMedia(file: File, altText?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (altText) formData.append('altText', altText);

  const { data } = await api.post<ApiResponse<Media>>('/media', formData);
  return data.data;
}

export async function updateMediaAlt(id: number, altText: string) {
  const { data } = await api.put<ApiResponse<Media>>(`/media/${id}`, { altText });
  return data.data;
}

export async function deleteMedia(id: number) {
  await api.delete(`/media/${id}`);
}