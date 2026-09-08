import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class Permission extends Model {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare module: string;
  declare description: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Permission.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    module: { type: DataTypes.STRING(50), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'permissions' },
);

export default Permission;
