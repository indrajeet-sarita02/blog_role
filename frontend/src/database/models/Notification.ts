import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class Notification extends Model {
  declare id: number;
  declare userId: number;
  declare type: string;
  declare title: string;
  declare message: string | null;
  declare data: Record<string, unknown> | null;
  declare readAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: true },
    data: { type: DataTypes.JSON, allowNull: true },
    readAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'notifications' },
);

export default Notification;
