import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '@config/database';

export interface SettingAttributes {
  id: number;
  key: string;
  value: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingCreationAttributes = Optional<SettingAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Setting
  extends Model<InferAttributes<Setting>, InferCreationAttributes<Setting>>
  implements SettingAttributes
{
  declare id: CreationOptional<number>;
  declare key: string;
  declare value: unknown;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Setting.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    value: { type: DataTypes.JSON, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'settings',
    paranoid: false,
  },
);

export default Setting;