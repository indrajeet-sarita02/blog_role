import { apiRequest } from '@/lib/api/client';
import { ApiListResponse, Permission, Role } from '@/types';

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function fetchRoles(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Role[]>>(`/api/roles${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Role>;
}

export async function fetchRole(id: number) {
  const res = await apiRequest<ApiBody<Role>>(`/api/roles/${id}`);
  return res.data;
}

export async function createRole(payload: {
  name: string;
  slug: string;
  description?: string | null;
}) {
  const res = await apiRequest<ApiBody<Role>>('/api/roles', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function updateRole(
  id: number,
  payload: { name?: string; description?: string | null },
) {
  const res = await apiRequest<ApiBody<Role>>(`/api/roles/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return res.data;
}

export async function deleteRole(id: number) {
  await apiRequest(`/api/roles/${id}`, { method: 'DELETE' });
}

export async function fetchRolePermissions(id: number) {
  const res = await apiRequest<ApiBody<Permission[]>>(`/api/roles/${id}/permissions`);
  return res.data;
}

export async function assignRolePermissions(id: number, permissionIds: number[]) {
  const res = await apiRequest<ApiBody<Permission[]>>(`/api/roles/${id}/permissions`, {
    method: 'PUT',
    body: { permissionIds },
  });
  return res.data;
}

export async function fetchPermissions(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Permission[]>>(`/api/permissions${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Permission>;
}
