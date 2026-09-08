import { apiRequest } from '@/lib/api/client';

export type Settings = Record<string, string>;

export async function fetchSettings(_params?: Record<string, string>) {
  const res = await apiRequest<{ success: boolean; message: string; data: Settings }>('/api/settings');
  return res.data as Settings;
}

export async function updateSettings(updates: Record<string, string>) {
  const res = await apiRequest<{ success: boolean; message: string; data: Settings }>('/api/settings', {
    method: 'PUT',
    body: updates,
  });
  return res.data as Settings;
}
