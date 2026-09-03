import { AuditLog } from '@database/index';
import { getRequestContext } from '@utils/context';
import { Transaction } from 'sequelize';

export interface AuditEntry {
  actorId?: number | null;
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: number | null;
  oldValues?: object | null;
  newValues?: object | null;
}

export async function writeAuditLog(entry: AuditEntry, transaction?: Transaction) {
  const { ip, userAgent } = getRequestContext();

  await AuditLog.create(
    {
      userId: entry.actorId ?? null,
      action: entry.action,
      module: entry.module,
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      oldValues: entry.oldValues ?? null,
      newValues: entry.newValues ?? null,
      ipAddress: ip ?? null,
      userAgent: userAgent ?? null,
    },
    { transaction },
  );
}