import { api } from './client';
import { ApiListResponse, ApiResponse, Comment } from '@/types';

export async function fetchComments(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Comment>>('/comments', { params });
  return data;
}

export async function fetchPostComments(postId: number) {
  const { data } = await api.get<ApiListResponse<Comment>>(`/posts/${postId}/comments`);
  return data;
}

export async function createComment(
  postId: number,
  payload: { content: string; parentId?: number | null },
) {
  const { data } = await api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, payload);
  return data.data;
}

export async function updateComment(id: number, content: string) {
  const { data } = await api.put<ApiResponse<Comment>>(`/comments/${id}`, { content });
  return data.data;
}

export async function deleteComment(id: number) {
  await api.delete(`/comments/${id}`);
}

export async function approveComment(id: number) {
  const { data } = await api.post<ApiResponse<Comment>>(`/comments/${id}/approve`);
  return data.data;
}

export async function rejectComment(id: number) {
  const { data } = await api.post<ApiResponse<Comment>>(`/comments/${id}/reject`);
  return data.data;
}