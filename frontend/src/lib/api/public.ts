import { apiRequest } from '@/lib/api/client';
import { ApiListResponse, Category, Post, Tag } from '@/types';

type ApiBody<T> = { success: boolean; message: string; data: T; meta?: unknown };

export async function fetchPublicPosts(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Post[]>>(`/api/public/posts${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Post>;
}

export async function fetchPublicPost(slug: string) {
  const res = await apiRequest<ApiBody<Post>>(`/api/public/posts/${slug}`);
  return res.data;
}

export async function fetchPublicCategory(slug: string) {
  const res = await apiRequest<ApiBody<Category>>(`/api/public/categories/${slug}`);
  return res.data;
}

export async function fetchPublicTag(slug: string) {
  const res = await apiRequest<ApiBody<Tag>>(`/api/public/tags/${slug}`);
  return res.data;
}

export async function fetchPublicCategories(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Category[]>>(`/api/public/categories${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Category>;
}

export async function fetchPublicTags(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Tag[]>>(`/api/public/tags${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Tag>;
}

export async function fetchPostsByCategory(slug: string, params?: Record<string, string>) {
  return fetchPublicPosts({ category: slug, ...params });
}

export async function fetchPostsByTag(slug: string, params?: Record<string, string>) {
  return fetchPublicPosts({ tag: slug, ...params });
}

export async function searchPublicPosts(params?: Record<string, string>) {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await apiRequest<ApiBody<Post[]>>(`/api/public/search${qs ? `?${qs}` : ''}`);
  return res as unknown as ApiListResponse<Post>;
}
