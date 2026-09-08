import { apiRequest } from '@/lib/api/client';
import { ApiListResponse, Comment } from '@/types';

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function fetchComments(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Comment[]>>(`/api/comments${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Comment>;
}

export async function fetchPostComments(postId: number) {
  const res = await apiRequest<ApiBody<Comment[]>>(`/api/posts/${postId}/comments?status=approved&limit=100`);
  return { success: true, message: 'Comments fetched', data: res.data, meta: { page: 1, limit: 100, total: res.data.length, totalPages: 1 } } as ApiListResponse<Comment>;
}

export async function createComment(
  postId: number,
  payload: { content: string; parentId?: number | null },
) {
  const res = await apiRequest<ApiBody<Comment>>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function updateComment(id: number, content: string) {
  const res = await apiRequest<ApiBody<Comment>>(`/api/comments/${id}`, {
    method: 'PUT',
    body: { content },
  });
  return res.data;
}

export async function deleteComment(id: number) {
  await apiRequest(`/api/comments/${id}`, { method: 'DELETE' });
}

export async function approveComment(id: number) {
  const res = await apiRequest<ApiBody<Comment>>(`/api/comments/${id}/approve`, { method: 'POST' });
  return res.data;
}

export async function rejectComment(id: number) {
  const res = await apiRequest<ApiBody<Comment>>(`/api/comments/${id}/reject`, { method: 'POST' });
  return res.data;
}
