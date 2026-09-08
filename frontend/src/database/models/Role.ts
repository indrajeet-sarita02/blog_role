import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class Role extends Model {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare isSystem: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    isSystem: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, tableName: 'roles' },
);

export default Role;
