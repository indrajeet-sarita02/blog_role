import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class Category extends Model {
  declare id: number;
  declare parentId: number | null;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare status: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Category.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    parentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  },
  { sequelize, tableName: 'categories' },
);

export default Category;
