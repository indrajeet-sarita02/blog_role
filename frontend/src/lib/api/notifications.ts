import { apiRequest } from '@/lib/api/client';
import { ApiListResponse, Notification } from '@/types';

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function fetchNotifications(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Notification[]>>(`/api/notifications${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Notification>;
}

export async function markNotificationRead(id: number) {
  await apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  await apiRequest('/api/notifications/read-all', { method: 'PATCH' });
}

export async function deleteNotification(id: number) {
  await apiRequest(`/api/notifications/${id}`, { method: 'DELETE' });
}
