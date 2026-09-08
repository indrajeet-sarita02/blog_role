import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class Setting extends Model {
  declare id: number;
  declare key: string;
  declare value: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Setting.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    value: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, tableName: 'settings' },
);

export default Setting;
