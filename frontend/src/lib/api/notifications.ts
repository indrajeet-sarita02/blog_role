import { api } from './client';
import { ApiListResponse, ApiResponse, Notification } from '@/types';

export async function fetchNotifications(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Notification>>('/notifications', { params });
  return data;
}

export async function markNotificationRead(id: number) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.patch('/notifications/read-all');
}

export async function deleteNotification(id: number) {
  await api.delete(`/notifications/${id}`);
}