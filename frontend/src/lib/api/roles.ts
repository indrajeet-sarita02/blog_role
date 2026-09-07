import { getStore, saveStore, delay, makeSlug, nextId } from '@/lib/mock/store';
import { ApiListResponse, ApiResponse, Permission, Role } from '@/types';

export async function fetchRoles(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  const roles = [...store.roles];

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = roles.length;
  const start = (page - 1) * limit;
  const paged = roles.slice(start, start + limit);

  return {
    success: true,
    message: 'Roles fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Role>;
}

export async function fetchRole(id: number) {
  await delay();
  const store = getStore();
  const role = store.roles.find((r) => r.id === id);
  if (!role) throw new Error('Role not found');
  return role;
}

export async function createRole(payload: {
  name: string;
  slug: string;
  description?: string | null;
}) {
  await delay();
  const store = getStore();
  const slug = payload.slug || makeSlug(payload.name);

  if (store.roles.find((r) => r.slug === slug)) {
    throw new Error('Role with this slug already exists');
  }

  const role: Role = {
    id: nextId(store, 'role'),
    name: payload.name,
    slug,
    description: payload.description || null,
    isSystem: false,
    permissions: [],
  };

  store.roles.push(role);
  saveStore(store);
  return role;
}

export async function updateRole(
  id: number,
  payload: { name?: string; description?: string | null },
) {
  await delay();
  const store = getStore();
  const role = store.roles.find((r) => r.id === id);
  if (!role) throw new Error('Role not found');
  if (role.isSystem) throw new Error('Cannot modify system roles');

  if (payload.name !== undefined) role.name = payload.name;
  if (payload.description !== undefined) role.description = payload.description;

  saveStore(store);
  return role;
}

export async function deleteRole(id: number) {
  await delay();
  const store = getStore();
  const role = store.roles.find((r) => r.id === id);
  if (role?.isSystem) throw new Error('Cannot delete system roles');
  store.roles = store.roles.filter((r) => r.id !== id);
  saveStore(store);
}

export async function fetchRolePermissions(id: number) {
  await delay();
  const store = getStore();
  const role = store.roles.find((r) => r.id === id);
  if (!role) throw new Error('Role not found');
  return role.permissions || [];
}

export async function assignRolePermissions(id: number, permissionIds: number[]) {
  await delay();
  const store = getStore();
  const role = store.roles.find((r) => r.id === id);
  if (!role) throw new Error('Role not found');
  role.permissions = store.permissions.filter((p) => permissionIds.includes(p.id));
  saveStore(store);
  return role.permissions;
}

export async function fetchPermissions(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let permissions = [...store.permissions];

  if (params?.module) {
    permissions = permissions.filter((p) => p.module === params.module);
  }

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '100');
  const total = permissions.length;
  const start = (page - 1) * limit;
  const paged = permissions.slice(start, start + limit);

  return {
    success: true,
    message: 'Permissions fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Permission>;
}
