import { apiRequest } from '@/lib/api/client';
import { ApiListResponse, Media } from '@/types';

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function fetchMedia(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Media[]>>(`/api/media${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Media>;
}

export async function uploadMedia(file: File, altText?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (altText) formData.append('altText', altText);
  const res = await apiRequest<ApiBody<Media>>('/api/media', {
    method: 'POST',
    body: formData,
    isFormData: true,
  });
  return res.data;
}

export async function updateMediaAlt(id: number, altText: string) {
  const res = await apiRequest<ApiBody<Media>>(`/api/media/${id}`, {
    method: 'PUT',
    body: { altText },
  });
  return res.data;
}

export async function deleteMedia(id: number) {
  await apiRequest(`/api/media/${id}`, { method: 'DELETE' });
}
