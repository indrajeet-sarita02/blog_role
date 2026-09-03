import { api } from './client';
import { ApiResponse } from '@/types';

export interface Settings {
  [key: string]: string;
}

export async function fetchSettings(params?: Record<string, string>) {
  const { data } = await api.get<ApiResponse<Settings>>('/settings', { params });
  return data.data;
}

export async function updateSettings(updates: Record<string, string>) {
  const { data } = await api.put<ApiResponse<Settings>>('/settings', updates);
  return data.data;
}