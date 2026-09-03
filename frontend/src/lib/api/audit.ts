import { api } from './client';
import { ApiListResponse } from '@/types';

export interface AuditLog {
  id: number;
  actorId: number;
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  createdAt: string;
  actor?: { id: number; name: string; email: string } | null;
}

export async function fetchAuditLogs(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<AuditLog>>('/audit', { params });
  return data;
}

export async function fetchAuditLog(id: number) {
  const { data } = await api.get<{ success: boolean; data: AuditLog }>(`/audit/${id}`);
  return data.data;
}