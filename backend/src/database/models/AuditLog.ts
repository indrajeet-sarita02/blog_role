import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '@config/database';
import User from './User';

export interface AuditLogAttributes {
  id: number;
  userId: number | null;
  action: string;
  module: string;
  entityType: string | null;
  entityId: number | null;
  oldValues: object | null;
  newValues: object | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export type AuditLogCreationAttributes = Optional<
  AuditLogAttributes,
  'id' | 'userId' | 'entityType' | 'entityId' | 'oldValues' | 'newValues' | 'ipAddress' | 'userAgent' | 'createdAt'
>;

class AuditLog
  extends Model<InferAttributes<AuditLog>, InferCreationAttributes<AuditLog>>
  implements AuditLogAttributes
{
  declare id: CreationOptional<number>;
  declare userId: number | null;
  declare action: string;
  declare module: string;
  declare entityType: string | null;
  declare entityId: number | null;
  declare oldValues: object | null;
  declare newValues: object | null;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare createdAt: CreationOptional<Date>;
}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, references: { model: User, key: 'id' } },
    action: { type: DataTypes.STRING(100), allowNull: false },
    module: { type: DataTypes.STRING(50), allowNull: false },
    entityType: { type: DataTypes.STRING(50), allowNull: true },
    entityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    oldValues: { type: DataTypes.JSON, allowNull: true },
    newValues: { type: DataTypes.JSON, allowNull: true },
    ipAddress: { type: DataTypes.STRING(45), allowNull: true },
    userAgent: { type: DataTypes.STRING(500), allowNull: true },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'audit_logs',
    paranoid: false,
    updatedAt: false,
  },
);

AuditLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export default AuditLog;