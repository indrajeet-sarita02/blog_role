import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '@config/database';

export interface CategoryAttributes {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  'id' | 'parentId' | 'description' | 'createdAt' | 'updatedAt'
>;

class Category
  extends Model<InferAttributes<Category>, InferCreationAttributes<Category>>
  implements CategoryAttributes
{
  declare id: CreationOptional<number>;
  declare parentId: number | null;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare status: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Category.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    parentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'categories',
    paranoid: false,
  },
);

Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });

export default Category;
