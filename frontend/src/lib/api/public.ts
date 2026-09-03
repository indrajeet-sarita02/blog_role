import { api } from './client';
import { ApiListResponse, ApiResponse, Category, Post, Tag } from '@/types';

export async function fetchPublicPosts(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Post>>('/public/posts', { params });
  return data;
}

export async function fetchPublicPost(slug: string) {
  const { data } = await api.get<ApiResponse<Post>>(`/public/posts/${slug}`);
  return data.data;
}

export async function fetchPublicCategory(slug: string) {
  const { data } = await api.get<ApiResponse<Category>>(`/public/categories/${slug}`);
  return data.data;
}

export async function fetchPublicTag(slug: string) {
  const { data } = await api.get<ApiResponse<Tag>>(`/public/tags/${slug}`);
  return data.data;
}

export async function fetchPublicCategories(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Category>>('/public/categories', { params });
  return data;
}

export async function fetchPublicTags(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Tag>>('/public/tags', { params });
  return data;
}

export async function fetchPostsByCategory(slug: string, params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Post>>('/public/posts', {
    params: { category: slug, ...params },
  });
  return data;
}

export async function fetchPostsByTag(slug: string, params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Post>>('/public/posts', {
    params: { tag: slug, ...params },
  });
  return data;
}

export async function searchPublicPosts(params?: Record<string, string>) {
  const { data } = await api.get<ApiListResponse<Post>>('/public/search', { params });
  return data;
}