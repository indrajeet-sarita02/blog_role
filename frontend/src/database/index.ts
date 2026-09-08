import { Sequelize } from 'sequelize';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH,
  logging: false,
  define: {
    underscored: true,
  },
});

let _initialized = false;

export async function initDatabase() {
  if (_initialized) return;
  _initialized = true;

  // Import all models so they register with sequelize
  await import('@/database/models/User');
  await import('@/database/models/Role');
  await import('@/database/models/Permission');
  await import('@/database/models/UserRole');
  await import('@/database/models/RolePermission');
  await import('@/database/models/Category');
  await import('@/database/models/Tag');
  await import('@/database/models/Post');
  await import('@/database/models/PostTag');
  await import('@/database/models/PostRevision');
  await import('@/database/models/Comment');
  await import('@/database/models/Media');
  await import('@/database/models/AuditLog');
  await import('@/database/models/Notification');
  await import('@/database/models/Setting');

  await sequelize.sync({ alter: true });
}
