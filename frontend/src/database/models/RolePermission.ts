import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class RolePermission extends Model {
  declare roleId: number;
  declare permissionId: number;
  declare createdAt: Date;
}

RolePermission.init(
  {
    roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
    permissionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
  },
  { sequelize, tableName: 'role_permissions', updatedAt: false },
);

export default RolePermission;
