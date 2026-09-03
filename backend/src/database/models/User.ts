import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '@config/database';
import { USER_STATUS } from '@config/constants';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string | null;
  bio: string | null;
  status: string;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'avatar' | 'bio' | 'emailVerifiedAt' | 'lastLoginAt' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

class User
  extends Model<InferAttributes<User>, InferCreationAttributes<User>>
  implements UserAttributes
{
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare avatar: string | null;
  declare bio: string | null;
  declare status: string;
  declare emailVerifiedAt: Date | null;
  declare lastLoginAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(USER_STATUS)),
      allowNull: false,
      defaultValue: USER_STATUS.ACTIVE,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    paranoid: false,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['passwordHash'] },
      },
    },
  },
);

export default User;
