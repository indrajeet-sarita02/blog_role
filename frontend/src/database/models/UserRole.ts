import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class UserRole extends Model {
  declare id: number;
  declare userId: number;
  declare roleId: number;
  declare createdAt: Date;
}

UserRole.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    sequelize,
    tableName: 'user_roles',
    updatedAt: false,
    indexes: [{ unique: true, fields: ['user_id', 'role_id'] }],
  },
);

export default UserRole;
