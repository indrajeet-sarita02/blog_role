import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class AuditLog extends Model {
  declare id: number;
  declare userId: number | null;
  declare action: string;
  declare module: string;
  declare entityType: string | null;
  declare entityId: number | null;
  declare oldValues: Record<string, unknown> | null;
  declare newValues: Record<string, unknown> | null;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare createdAt: Date;
}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    action: { type: DataTypes.STRING(100), allowNull: false },
    module: { type: DataTypes.STRING(50), allowNull: false },
    entityType: { type: DataTypes.STRING(50), allowNull: true },
    entityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    oldValues: { type: DataTypes.JSON, allowNull: true },
    newValues: { type: DataTypes.JSON, allowNull: true },
    ipAddress: { type: DataTypes.STRING(45), allowNull: true },
    userAgent: { type: DataTypes.STRING(500), allowNull: true },
  },
  { sequelize, tableName: 'audit_logs', updatedAt: false },
);

export default AuditLog;
