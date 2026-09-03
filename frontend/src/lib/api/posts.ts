import { api } from './client';
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

export async function fetchPosts(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Post>>('/posts', { params });
  return data;
}

export async function fetchPost(id: number) {
  const { data } = await api.get<ApiResponse<Post>>(`/posts/${id}`);
  return data.data;
}

export async function fetchMyPosts(authorId: number, params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Post>>('/posts', {
    params: { authorId: String(authorId), ...params },
  });
  return data;
}

export async function createPost(payload: PostPayload) {
  const { data } = await api.post<ApiResponse<Post>>('/posts', payload);
  return data.data;
}

export async function updatePost(id: number, payload: PostPayload) {
  const { data } = await api.put<ApiResponse<Post>>(`/posts/${id}`, payload);
  return data.data;
}

export async function deletePost(id: number) {
  await api.delete(`/posts/${id}`);
}

export async function submitPostForReview(id: number) {
  const { data } = await api.post<ApiResponse<Post>>(`/posts/${id}/submit-review`);
  return data.data;
}

export async function approvePost(id: number) {
  const { data } = await api.post<ApiResponse<Post>>(`/posts/${id}/approve`);
  return data.data;
}

export async function rejectPost(id: number, reason: string) {
  const { data } = await api.post<ApiResponse<Post>>(`/posts/${id}/reject`, { reason });
  return data.data;
}

export async function publishPost(id: number) {
  const { data } = await api.post<ApiResponse<Post>>(`/posts/${id}/publish`);
  return data.data;
}

export async function archivePost(id: number) {
  const { data } = await api.post<ApiResponse<Post>>(`/posts/${id}/archive`);
  return data.data;
}

export async function fetchPostRevisions(id: number) {
  const { data } = await api.get<ApiListResponse<PostRevision>>(`/posts/${id}/revisions`);
  return data.data;
}

export async function restoreRevision(id: number, revisionId: number) {
  const { data } = await api.post<ApiResponse<Post>>(`/posts/${id}/revisions/${revisionId}/restore`);
  return data.data;
}