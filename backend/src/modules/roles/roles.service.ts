import { Role, Permission, RolePermission } from '@database/index';import { AppError } from '@utils/AppError';
import { slugify } from '@utils/slug';
import { parsePagination } from '@utils/pagination';
import { writeAuditLog } from '@utils/audit';
import { Op, WhereOptions } from 'sequelize';

export async function listRoles(filters: {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const searchCondition: WhereOptions<Role>[] = [];
  if (filters.search) {
    searchCondition.push(
      { name: { [Op.like]: `%${filters.search}%` } },
      { slug: { [Op.like]: `%${filters.search}%` } },
    );
  }
  const where: WhereOptions<Role> = {
    ...(searchCondition.length ? { [Op.or]: searchCondition } : {}),
  };

  const { rows, count } = await Role.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    distinct: true,
  });

  return {
    roles: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function getRoleById(id: number) {
  const role = await Role.findByPk(id, {
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
  });
  if (!role) {
    throw AppError.notFound('Role not found');
  }
  return role;
}

export async function createRole(data: {
  name: string;
  slug?: string;
  description?: string | null;
}, actorId: string) {
  const existing = await Role.findOne({ where: { slug: data.slug || slugify(data.name) } });
  if (existing) {
    throw AppError.conflict('Role with this slug already exists');
  }

  const role = await Role.create({
    name: data.name,
    slug: data.slug || slugify(data.name),
    description: data.description ?? null,
    isSystem: false,
  });

  await writeAuditLog({
    actorId: Number(actorId),
    action: 'ROLE_CREATED',
    module: 'role',
    entityType: 'role',
    entityId: role.id,
    newValues: { name: role.name, slug: role.slug },
  });

  return getRoleById(role.id);
}

export async function updateRole(id: number, data: { name?: string; description?: string | null }, actorId: string) {
  const role = await Role.findByPk(id);
  if (!role) {
    throw AppError.notFound('Role not found');
  }
  const oldValues = { name: role.name, description: role.description };
  await role.update(data);
  await writeAuditLog({
    actorId: Number(actorId),
    action: 'ROLE_UPDATED',
    module: 'role',
    entityType: 'role',
    entityId: id,
    oldValues,
    newValues: { name: role.name, description: role.description },
  });
  return getRoleById(id);
}

export async function deleteRole(id: number, actorId: string) {
  const role = await Role.findByPk(id);
  if (!role) {
    throw AppError.notFound('Role not found');
  }
  if (role.isSystem) {
    throw AppError.forbidden('System roles cannot be deleted');
  }
  await RolePermission.destroy({ where: { roleId: id } });
  await role.destroy();
  await writeAuditLog({
    actorId: Number(actorId),
    action: 'ROLE_DELETED',
    module: 'role',
    entityType: 'role',
    entityId: id,
    oldValues: { name: role.name, slug: role.slug },
  });
}

export async function getRolePermissions(id: number) {
  const role = await Role.findByPk(id);
  if (!role) {
    throw AppError.notFound('Role not found');
  }
  const permissions = await Permission.findAll({
    include: [{ model: Role, as: 'roles', where: { id }, attributes: [], through: { attributes: [] } }],
  });
  return permissions;
}

export async function updateRolePermissions(id: number, permissionIds: number[], actorId: string) {
  const role = await Role.findByPk(id);
  if (!role) {
    throw AppError.notFound('Role not found');
  }

  const permissions = await Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });
  if (permissions.length !== permissionIds.length) {
    throw AppError.badRequest('One or more permissions do not exist');
  }

  await RolePermission.destroy({ where: { roleId: id } });
  await RolePermission.bulkCreate(permissionIds.map((permissionId) => ({ roleId: id, permissionId })));

  await writeAuditLog({
    actorId: Number(actorId),
    action: 'PERMISSION_ASSIGNED',
    module: 'role',
    entityType: 'role',
    entityId: id,
    newValues: { permissionIds },
  });

  return Permission.findAll({
    include: [{ model: Role, as: 'roles', where: { id }, attributes: [], through: { attributes: [] } }],
  });
}
