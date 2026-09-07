import { getStore, delay } from '@/lib/mock/store';
import { ApiListResponse } from '@/types';
import { AuditLogEntry } from '@/lib/mock/store';

export type { AuditLogEntry } from '@/lib/mock/store';
export type AuditLog = AuditLogEntry;

export async function fetchAuditLogs(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let logs = [...store.auditLogs];

  if (params?.module) logs = logs.filter((l) => l.module === params.module);
  if (params?.action) logs = logs.filter((l) => l.action === params.action);

  logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = logs.length;
  const start = (page - 1) * limit;
  const paged = logs.slice(start, start + limit);

  return {
    success: true,
    message: 'Audit logs fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<AuditLogEntry>;
}

export async function fetchAuditLog(id: number) {
  await delay();
  const store = getStore();
  const log = store.auditLogs.find((l) => l.id === id);
  if (!log) throw new Error('Audit log not found');
  return log;
}
