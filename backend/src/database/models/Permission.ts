import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '@config/database';

export interface PermissionAttributes {
  id: number;
  name: string;
  slug: string;
  module: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PermissionCreationAttributes = Optional<
  PermissionAttributes,
  'id' | 'description' | 'createdAt' | 'updatedAt'
>;

class Permission
  extends Model<InferAttributes<Permission>, InferCreationAttributes<Permission>>
  implements PermissionAttributes
{
  declare id: CreationOptional<number>;
  declare name: string;
  declare slug: string;
  declare module: string;
  declare description: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'permissions',
    paranoid: false,
  },
);

export default Permission;
