import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '@config/database';

export interface RoleAttributes {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type RoleCreationAttributes = Optional<RoleAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'>;

class Role
  extends Model<InferAttributes<Role>, InferCreationAttributes<Role>>
  implements RoleAttributes
{
  declare id: CreationOptional<number>;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare isSystem: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Role.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'roles',
    paranoid: false,
  },
);

export default Role;
