import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class Tag extends Model {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Tag.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  { sequelize, tableName: 'tags' },
);

export default Tag;
