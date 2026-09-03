import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '@config/database';
import Role from './Role';
import Permission from './Permission';

export interface RolePermissionAttributes {
  id: number;
  roleId: number;
  permissionId: number;
  createdAt: Date;
}

export type RolePermissionCreationAttributes = Optional<RolePermissionAttributes, 'id' | 'createdAt'>;

class RolePermission
  extends Model<InferAttributes<RolePermission>, InferCreationAttributes<RolePermission>>
  implements RolePermissionAttributes
{
  declare id: CreationOptional<number>;
  declare roleId: ForeignKey<number>;
  declare permissionId: ForeignKey<number>;
  declare createdAt: CreationOptional<Date>;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: Role, key: 'id' },
    },
    permissionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: Permission, key: 'id' },
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'role_permissions',
    paranoid: false,
    updatedAt: false,
    indexes: [{ unique: true, fields: ['role_id', 'permission_id'] }],
  },
);

export default RolePermission;
