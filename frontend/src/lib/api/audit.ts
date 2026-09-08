import { apiRequest } from '@/lib/api/client';
import { ApiListResponse } from '@/types';

export interface AuditLogEntry {
  id: number;
  userId: number | null;
  actorId?: number | null;
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

export type AuditLog = AuditLogEntry;

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function fetchAuditLogs(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<AuditLogEntry[]>>(`/api/audit${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<AuditLogEntry>;
}

export async function fetchAuditLog(id: number) {
  const res = await apiRequest<ApiBody<AuditLogEntry>>(`/api/audit/${id}`);
  return res.data;
}
