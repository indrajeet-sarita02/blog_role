import { api } from './client';
import { ApiListResponse, ApiResponse, Permission, Role } from '@/types';

export async function fetchRoles(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Role>>('/roles', { params });
  return data;
}

export async function fetchRole(id: number) {
  const { data } = await api.get<ApiResponse<Role>>(`/roles/${id}`);
  return data.data;
}

export async function createRole(payload: { name: string; slug: string; description?: string | null }) {
  const { data } = await api.post<ApiResponse<Role>>('/roles', payload);
  return data.data;
}

export async function updateRole(id: number, payload: { name?: string; description?: string | null }) {
  const { data } = await api.put<ApiResponse<Role>>(`/roles/${id}`, payload);
  return data.data;
}

export async function deleteRole(id: number) {
  await api.delete(`/roles/${id}`);
}

export async function fetchRolePermissions(id: number) {
  const { data } = await api.get<ApiResponse<Permission[]>>(`/roles/${id}/permissions`);
  return data.data;
}

export async function assignRolePermissions(id: number, permissionIds: number[]) {
  const { data } = await api.put<ApiResponse<Permission[]>>(`/roles/${id}/permissions`, {
    permissionIds,
  });
  return data.data;
}

export async function fetchPermissions(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Permission>>('/permissions', { params });
  return data;
}