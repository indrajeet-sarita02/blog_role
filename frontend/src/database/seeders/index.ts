import { sequelize, initDatabase } from '@/database';
import User from '@/database/models/User';
import Role from '@/database/models/Role';
import Permission from '@/database/models/Permission';
import UserRole from '@/database/models/UserRole';
import RolePermission from '@/database/models/RolePermission';
import Category from '@/database/models/Category';
import Tag from '@/database/models/Tag';
import Post from '@/database/models/Post';
import PostTag from '@/database/models/PostTag';
import PostRevision from '@/database/models/PostRevision';
import Comment from '@/database/models/Comment';
import Media from '@/database/models/Media';
import AuditLog from '@/database/models/AuditLog';
import Notification from '@/database/models/Notification';
import Setting from '@/database/models/Setting';

// Associations
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId', as: 'users' });
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId', as: 'roles' });
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Post.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Post.belongsToMany(Tag, { through: PostTag, foreignKey: 'postId', otherKey: 'tagId', as: 'tags' });
Tag.belongsToMany(Post, { through: PostTag, foreignKey: 'tagId', otherKey: 'postId', as: 'posts' });
PostRevision.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Comment.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
Media.belongsTo(User, { as: 'user', foreignKey: 'userId' });
AuditLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });

const sg = globalThis as unknown as { __blogDbReady?: boolean };

export async function ensureDb() {
  if (sg.__blogDbReady) return;
  sg.__blogDbReady = true;
  await initDatabase();
  await ensureSeeded();
}

async function ensureSeeded() {
  try {
    const { seedDatabase } = await import('./seed');
    await seedDatabase();
  } catch (e) {
    console.error('Seeding failed', e);
  }
}

export {
  sequelize, User, Role, Permission, UserRole, RolePermission,
  Category, Tag, Post, PostTag, PostRevision, Comment, Media,
  AuditLog, Notification, Setting,
};
