import { apiRequest } from '@/lib/api/client';
import { ApiListResponse, ApiResponse, Post, PostRevision, PostStatus } from '@/types';

export interface PostPayload {
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  categoryId?: number | null;
  tagIds?: number[];
  status?: PostStatus;
  visibility?: 'public' | 'private';
  featuredImage?: string | null;
}

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function fetchPosts(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Post[]>>(`/api/posts${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Post>;
}

export async function fetchPost(id: number) {
  const res = await apiRequest<ApiBody<Post>>(`/api/posts/${id}`);
  return res.data;
}

export async function fetchMyPosts(authorId: number, params?: Record<string, string>) {
  return fetchPosts({ authorId: String(authorId), ...params });
}

export async function createPost(payload: PostPayload) {
  const res = await apiRequest<ApiBody<Post>>('/api/posts', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function updatePost(id: number, payload: PostPayload) {
  const res = await apiRequest<ApiBody<Post>>(`/api/posts/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return res.data;
}

export async function deletePost(id: number) {
  await apiRequest(`/api/posts/${id}`, { method: 'DELETE' });
}

async function transitionPost(id: number, action: string): Promise<Post> {
  const res = await apiRequest<ApiBody<Post>>(`/api/posts/${id}/${action}`, {
    method: 'POST',
  });
  return res.data;
}

export async function submitPostForReview(id: number) {
  return transitionPost(id, 'submit-review');
}

export async function approvePost(id: number) {
  return transitionPost(id, 'approve');
}

export async function rejectPost(id: number, _reason?: string) {
  return transitionPost(id, 'reject');
}

export async function publishPost(id: number) {
  return transitionPost(id, 'publish');
}

export async function archivePost(id: number) {
  return transitionPost(id, 'archive');
}

export async function fetchPostRevisions(id: number) {
  const res = await apiRequest<ApiBody<PostRevision[]>>(`/api/posts/${id}/revisions`);
  return res.data;
}

export async function restoreRevision(id: number, revisionId: number) {
  const res = await apiRequest<ApiBody<Post>>(`/api/posts/${id}/revisions/${revisionId}/restore`, {
    method: 'POST',
  });
  return res.data;
}
