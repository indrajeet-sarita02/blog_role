import { api } from './client';
import { ApiListResponse, ApiResponse, LoginResponse, User } from '@/types';

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
  return data.data;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/register', {
    name,
    email,
    password,
  });
  return data.data;
}

export async function fetchMe() {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  return data.data;
}

export async function fetchUsers(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<User>>('/users', { params });
  return data;
}

export async function fetchUser(id: number) {
  const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
  return data.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  roleIds?: number[];
}) {
  const { data } = await api.post<ApiResponse<User>>('/users', payload);
  return data.data;
}

export async function updateUser(id: number, payload: { name?: string; avatar?: string; bio?: string }) {
  const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
  return data.data;
}

export async function updateUserStatus(id: number, status: string) {
  const { data } = await api.patch<ApiResponse<User>>(`/users/${id}/status`, { status });
  return data.data;
}

export async function updateUserRoles(id: number, roleIds: number[]) {
  const { data } = await api.put<ApiResponse<User>>(`/users/${id}/roles`, { roleIds });
  return data.data;
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`);
}