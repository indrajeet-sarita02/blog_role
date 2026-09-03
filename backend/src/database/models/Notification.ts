import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '@config/database';
import User from './User';

export interface NotificationAttributes {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string | null;
  data: object | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  'id' | 'message' | 'data' | 'readAt' | 'createdAt' | 'updatedAt'
>;

class Notification
  extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>>
  implements NotificationAttributes
{
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<number>;
  declare type: string;
  declare title: string;
  declare message: string | null;
  declare data: object | null;
  declare readAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: User, key: 'id' } },
    type: { type: DataTypes.STRING(50), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: true },
    data: { type: DataTypes.JSON, allowNull: true },
    readAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'notifications',
    paranoid: false,
  },
);

Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export default Notification;