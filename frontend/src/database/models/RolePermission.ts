import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class RolePermission extends Model {
  declare id: number;
  declare roleId: number;
  declare permissionId: number;
  declare createdAt: Date;
}

RolePermission.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    permissionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    updatedAt: false,
    indexes: [{ unique: true, fields: ['role_id', 'permission_id'] }],
  },
);

export default RolePermission;
