import { User, Role, UserRole } from '@database/index';
import { AppError } from '@utils/AppError';
import { hashPassword } from '@utils/password';
import { parsePagination } from '@utils/pagination';
import { USER_STATUS } from '@config/constants';
import { Op, WhereOptions } from 'sequelize';
import { writeAuditLog } from '@utils/audit';

export async function listUsers(filters: {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const searchCondition: WhereOptions<User>[] = [];
  if (filters.search) {
    searchCondition.push(
      { name: { [Op.like]: `%${filters.search}%` } },
      { email: { [Op.like]: `%${filters.search}%` } },
    );
  }
  const where: WhereOptions<User> = {
    ...(filters.status ? { status: filters.status as User['status'] } : {}),
    ...(searchCondition.length ? { [Op.or]: searchCondition } : {}),
  };

  const { rows, count } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    attributes: ['id', 'name', 'email', 'avatar', 'bio', 'status', 'createdAt'],
    include: [{ model: Role, as: 'roles', attributes: ['id', 'name', 'slug'] }],
    distinct: true,
  });

  return {
    users: rows,
    meta: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getUserById(id: number) {
  const user = await User.findByPk(id, {
    attributes: ['id', 'name', 'email', 'avatar', 'bio', 'status', 'createdAt'],
    include: [{ model: Role, as: 'roles', attributes: ['id', 'name', 'slug'] }],
  });
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user;
}

export async function updateUser(id: number, data: { name?: string; avatar?: string | null; bio?: string | null }) {
  const user = await User.findByPk(id);
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user.update(data);
}

export async function updateUserStatus(id: number, status: string, actorId: string) {
  const user = await User.findByPk(id);
  if (!user) {
    throw AppError.notFound('User not found');
  }
  const oldStatus = user.status;
  user.status = status;
  await user.save({ fields: ['status'] });
  await writeAuditLog({
    actorId: Number(actorId),
    action: 'USER_STATUS_UPDATED',
    module: 'user',
    entityType: 'user',
    entityId: id,
    oldValues: { status: oldStatus },
    newValues: { status },
  });
  return user;
}

export async function updateUserRoles(id: number, roleIds: number[], actorId: string) {
  const user = await User.findByPk(id);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  const roles = await Role.findAll({ where: { id: { [Op.in]: roleIds } } });
  if (roles.length !== roleIds.length) {
    throw AppError.badRequest('One or more roles do not exist');
  }

  await UserRole.destroy({ where: { userId: id } });
  await UserRole.bulkCreate(roleIds.map((roleId) => ({ userId: id, roleId })));

  await writeAuditLog({
    actorId: Number(actorId),
    action: 'USER_ROLES_UPDATED',
    module: 'user',
    entityType: 'user',
    entityId: id,
    newValues: { roleIds },
  });

  return getUserById(id);
}

export async function createUser(
  data: {
    name: string;
    email: string;
    password: string;
    roleIds?: number[];
  },
  actorId: string,
) {
  const existing = await User.findOne({ where: { email: data.email } });
  if (existing) {
    throw AppError.conflict('Email is already registered');
  }

  const passwordHash = await hashPassword(data.password);
  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash,
    status: USER_STATUS.ACTIVE,
  });

  if (data.roleIds && data.roleIds.length) {
    await UserRole.bulkCreate(data.roleIds.map((roleId) => ({ userId: user.id, roleId })));
  }

  await writeAuditLog({
    actorId: Number(actorId),
    action: 'USER_CREATED',
    module: 'user',
    entityType: 'user',
    entityId: user.id,
    newValues: { name: user.name, email: user.email, roleIds: data.roleIds ?? [] },
  });

  return getUserById(user.id);
}

export async function deleteUser(id: number, actorId: string) {
  const user = await User.findByPk(id);
  if (!user) {
    throw AppError.notFound('User not found');
  }
  await UserRole.destroy({ where: { userId: id } });
  await user.destroy();
  await writeAuditLog({
    actorId: Number(actorId),
    action: 'USER_DELETED',
    module: 'user',
    entityType: 'user',
    entityId: id,
    oldValues: { name: user.name, email: user.email },
  });
}
