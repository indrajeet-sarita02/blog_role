import { apiRequest } from '@/lib/api/client';
import { ApiListResponse, LoginResponse, User } from '@/types';

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function login(email: string, password: string) {
  const res = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return res.data as LoginResponse;
}

export async function register(name: string, email: string, password: string) {
  const res = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
  return res.data as LoginResponse;
}

export async function fetchMe() {
  const res = await apiRequest<ApiBody<User>>('/api/auth/me');
  return res.data;
}

export async function fetchUsers(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<User[]>>(`/api/users${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<User>;
}

export async function fetchUser(id: number) {
  const res = await apiRequest<ApiBody<User>>(`/api/users/${id}`);
  return res.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  roleIds?: number[];
}) {
  const res = await apiRequest<ApiBody<User>>('/api/users', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function updateUser(
  id: number,
  payload: { name?: string; avatar?: string; bio?: string },
) {
  const res = await apiRequest<ApiBody<User>>(`/api/users/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return res.data;
}

export async function updateUserStatus(id: number, status: string) {
  const res = await apiRequest<ApiBody<User>>(`/api/users/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
  return res.data;
}

export async function updateUserRoles(id: number, roleIds: number[]) {
  const res = await apiRequest<ApiBody<User>>(`/api/users/${id}/roles`, {
    method: 'PUT',
    body: { roleIds },
  });
  return res.data;
}

export async function deleteUser(id: number) {
  await apiRequest(`/api/users/${id}`, { method: 'DELETE' });
}
