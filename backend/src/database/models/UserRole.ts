import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '@config/database';
import User from './User';
import Role from './Role';

export interface UserRoleAttributes {
  id: number;
  userId: number;
  roleId: number;
  createdAt: Date;
}

export type UserRoleCreationAttributes = Optional<UserRoleAttributes, 'id' | 'createdAt'>;

class UserRole
  extends Model<InferAttributes<UserRole>, InferCreationAttributes<UserRole>>
  implements UserRoleAttributes
{
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<number>;
  declare roleId: ForeignKey<number>;
  declare createdAt: CreationOptional<Date>;
}

UserRole.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: User, key: 'id' },
    },
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: Role, key: 'id' },
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'user_roles',
    paranoid: false,
    updatedAt: false,
    indexes: [{ unique: true, fields: ['user_id', 'role_id'] }],
  },
);

export default UserRole;
