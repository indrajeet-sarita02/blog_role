import { sequelize } from '@config/database';
import User from './models/User';
import Role from './models/Role';
import Permission from './models/Permission';
import UserRole from './models/UserRole';
import RolePermission from './models/RolePermission';
import Category from './models/Category';
import Tag from './models/Tag';
import Post from './models/Post';
import PostTag from './models/PostTag';
import PostRevision from './models/PostRevision';
import Comment from './models/Comment';
import Media from './models/Media';
import AuditLog from './models/AuditLog';
import Notification from './models/Notification';
import Setting from './models/Setting';

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId', as: 'users' });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles',
});

export { sequelize };
export { User, Role, Permission, UserRole, RolePermission, Category, Tag, Post, PostTag, PostRevision, Comment, Media, AuditLog, Notification, Setting };
