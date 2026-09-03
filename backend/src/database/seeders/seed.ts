import { sequelize, Role, Permission, User, UserRole, RolePermission } from '@database/index';
import { hashPassword } from '@utils/password';
import { USER_STATUS } from '@config/constants';

const PERMISSIONS = [
  { name: 'Create Blog', slug: 'blog.create', module: 'blog' },
  { name: 'View Blog', slug: 'blog.view', module: 'blog' },
  { name: 'View All Blogs', slug: 'blog.viewAny', module: 'blog' },
  { name: 'Update Blog', slug: 'blog.update', module: 'blog' },
  { name: 'Update Any Blog', slug: 'blog.updateAny', module: 'blog' },
  { name: 'Delete Blog', slug: 'blog.delete', module: 'blog' },
  { name: 'Delete Any Blog', slug: 'blog.deleteAny', module: 'blog' },
  { name: 'Publish Blog', slug: 'blog.publish', module: 'blog' },
  { name: 'Approve Blog', slug: 'blog.approve', module: 'blog' },
  { name: 'Reject Blog', slug: 'blog.reject', module: 'blog' },
  { name: 'Archive Blog', slug: 'blog.archive', module: 'blog' },

  { name: 'Create Comment', slug: 'comment.create', module: 'comment' },
  { name: 'View Comment', slug: 'comment.view', module: 'comment' },
  { name: 'View All Comments', slug: 'comment.viewAny', module: 'comment' },
  { name: 'Update Comment', slug: 'comment.update', module: 'comment' },
  { name: 'Update Any Comment', slug: 'comment.updateAny', module: 'comment' },
  { name: 'Delete Comment', slug: 'comment.delete', module: 'comment' },
  { name: 'Delete Any Comment', slug: 'comment.deleteAny', module: 'comment' },
  { name: 'Approve Comment', slug: 'comment.approve', module: 'comment' },
  { name: 'Reject Comment', slug: 'comment.reject', module: 'comment' },

  { name: 'Create User', slug: 'user.create', module: 'user' },
  { name: 'View User', slug: 'user.view', module: 'user' },
  { name: 'Update User', slug: 'user.update', module: 'user' },
  { name: 'Delete User', slug: 'user.delete', module: 'user' },
  { name: 'Activate User', slug: 'user.activate', module: 'user' },
  { name: 'Deactivate User', slug: 'user.deactivate', module: 'user' },

  { name: 'Create Role', slug: 'role.create', module: 'role' },
  { name: 'View Role', slug: 'role.view', module: 'role' },
  { name: 'Update Role', slug: 'role.update', module: 'role' },
  { name: 'Delete Role', slug: 'role.delete', module: 'role' },
  { name: 'Assign Permission', slug: 'role.assignPermission', module: 'role' },

  { name: 'View Permission', slug: 'permission.view', module: 'permission' },

  { name: 'Create Category', slug: 'category.create', module: 'category' },
  { name: 'View Category', slug: 'category.view', module: 'category' },
  { name: 'Update Category', slug: 'category.update', module: 'category' },
  { name: 'Delete Category', slug: 'category.delete', module: 'category' },

  { name: 'Create Tag', slug: 'tag.create', module: 'tag' },
  { name: 'View Tag', slug: 'tag.view', module: 'tag' },
  { name: 'Update Tag', slug: 'tag.update', module: 'tag' },
  { name: 'Delete Tag', slug: 'tag.delete', module: 'tag' },

  { name: 'Upload Media', slug: 'media.upload', module: 'media' },
  { name: 'View Media', slug: 'media.view', module: 'media' },
  { name: 'Delete Media', slug: 'media.delete', module: 'media' },

  { name: 'View Audit', slug: 'audit.view', module: 'audit' },
  { name: 'View Settings', slug: 'settings.view', module: 'settings' },
  { name: 'Update Settings', slug: 'settings.update', module: 'settings' },
];

const ROLE_DEFINITIONS: Record<string, { name: string; description: string; permissions: string[] }> = {
  'super-admin': {
    name: 'Super Admin',
    description: 'Complete system access',
    permissions: PERMISSIONS.map((p) => p.slug),
  },
  admin: {
    name: 'Admin',
    description: 'Administrative and content management access',
    permissions: PERMISSIONS.filter((p) => !p.slug.startsWith('role.')).map((p) => p.slug),
  },
  editor: {
    name: 'Editor',
    description: 'Can manage and approve content',
    permissions: [
      'blog.create', 'blog.view', 'blog.update', 'blog.updateAny',
      'blog.delete', 'blog.deleteAny', 'blog.publish', 'blog.approve',
      'blog.reject', 'blog.archive',
      'comment.create', 'comment.view', 'comment.viewAny', 'comment.update', 'comment.updateAny',
      'comment.delete', 'comment.deleteAny', 'comment.approve', 'comment.reject',
      'category.create', 'category.view', 'category.update', 'category.delete',
      'tag.create', 'tag.view', 'tag.update', 'tag.delete',
      'media.upload', 'media.view', 'media.delete',
    ],
  },
  author: {
    name: 'Author',
    description: 'Can create and manage own posts',
    permissions: [
      'blog.create', 'blog.view', 'blog.update', 'blog.delete', 'blog.publish',
      'comment.create', 'comment.view', 'comment.update', 'comment.delete',
      'media.upload', 'media.view',
    ],
  },
  contributor: {
    name: 'Contributor',
    description: 'Can create posts and submit them for review',
    permissions: [
      'blog.create', 'blog.view', 'blog.update', 'blog.delete',
      'comment.create', 'comment.view', 'comment.update', 'comment.delete',
    ],
  },
  user: {
    name: 'User',
    description: 'Can read, comment, reply, and manage own comments',
    permissions: [
      'blog.view', 'comment.create', 'comment.view', 'comment.update', 'comment.delete',
    ],
  },
};

async function run() {
  await sequelize.sync();

  const permissionBySlug = new Map<string, Permission>();
  for (const p of PERMISSIONS) {
    const [permission] = await Permission.findOrCreate({
      where: { slug: p.slug },
      defaults: p,
    });
    permissionBySlug.set(p.slug, permission);
  }
  console.log(`Seeded ${PERMISSIONS.length} permissions`);

  const roleBySlug = new Map<string, Role>();
  for (const [slug, def] of Object.entries(ROLE_DEFINITIONS)) {
    const [role] = await Role.findOrCreate({
      where: { slug },
      defaults: {
        name: def.name,
        slug,
        description: def.description,
        isSystem: true,
      },
    });
    roleBySlug.set(slug, role);

    await RolePermission.destroy({ where: { roleId: role.id } });
    await RolePermission.bulkCreate(
      def.permissions.map((s) => ({ roleId: role.id, permissionId: permissionBySlug.get(s)!.id })),
    );
  }
  console.log(`Seeded ${Object.keys(ROLE_DEFINITIONS).length} roles`);

  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const passwordHash = await hashPassword(adminPassword);
      admin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        passwordHash,
        status: USER_STATUS.ACTIVE,
      });
    }

    const superAdminRole = roleBySlug.get('super-admin')!;
    await UserRole.findOrCreate({
      where: { userId: admin.id, roleId: superAdminRole.id },
      defaults: { userId: admin.id, roleId: superAdminRole.id },
    });
    console.log(`Super admin ensured: ${adminEmail}`);
  } else {
    console.log('SUPER_ADMIN_EMAIL/PASSWORD not set - skipping super admin creation');
  }

  console.log('Seed complete');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
