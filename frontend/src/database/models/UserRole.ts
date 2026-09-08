import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/database';

class UserRole extends Model {
  declare userId: number;
  declare roleId: number;
  declare createdAt: Date;
}

UserRole.init(
  {
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
    roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
  },
  { sequelize, tableName: 'user_roles', updatedAt: false },
);

export default UserRole;
