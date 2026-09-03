import { User, Role, Permission } from '@database/index';

export interface ResolvedPermissions {
  userId: string;
  roles: string[];
  permissions: Set<string>;
}

export async function resolveUserPermissions(userId: string): Promise<ResolvedPermissions> {
  const user = (await User.findByPk(userId, {
    include: [
      {
        model: Role,
        as: 'roles',
        include: [{ model: Permission, as: 'permissions' }],
      },
    ],
  })) as (User & { roles: Array<Role & { permissions: Permission[] }> }) | null;

  if (!user) {
    return { userId, roles: [], permissions: new Set() };
  }

  const roles = user.roles.map((r) => r.slug);
  const permissions = new Set<string>();
  for (const role of user.roles) {
    for (const permission of role.permissions) {
      permissions.add(permission.slug);
    }
  }

  return { userId, roles, permissions };
}
