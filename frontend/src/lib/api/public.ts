import { getStore, delay } from '@/lib/mock/store';
import { ApiListResponse, ApiResponse, Category, Post, Tag } from '@/types';

export async function fetchPublicPosts(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let posts = store.posts.filter((p) => p.status === 'published' && p.visibility === 'public');

  if (params?.category) {
    const cat = store.categories.find((c) => c.slug === params.category);
    if (cat) posts = posts.filter((p) => p.categoryId === cat.id);
  }
  if (params?.tag) {
    const tag = store.tags.find((t) => t.slug === params.tag);
    if (tag) posts = posts.filter((p) => p.tags?.some((t) => t.id === tag.id));
  }

  posts.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = posts.length;
  const start = (page - 1) * limit;
  const paged = posts.slice(start, start + limit);

  return {
    success: true,
    message: 'Posts fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Post>;
}

export async function fetchPublicPost(slug: string) {
  await delay();
  const store = getStore();
  const post = store.posts.find((p) => p.slug === slug && p.status === 'published');
  if (!post) throw new Error('Post not found');
  return post;
}

export async function fetchPublicCategory(slug: string) {
  await delay();
  const store = getStore();
  const cat = store.categories.find((c) => c.slug === slug);
  if (!cat) throw new Error('Category not found');
  return cat;
}

export async function fetchPublicTag(slug: string) {
  await delay();
  const store = getStore();
  const tag = store.tags.find((t) => t.slug === slug);
  if (!tag) throw new Error('Tag not found');
  return tag;
}

export async function fetchPublicCategories(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let categories = [...store.categories];

  if (params?.search) {
    const s = params.search.toLowerCase();
    categories = categories.filter((c) => c.name.toLowerCase().includes(s));
  }

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '100');
  const total = categories.length;
  const start = (page - 1) * limit;
  const paged = categories.slice(start, start + limit);

  return {
    success: true,
    message: 'Categories fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Category>;
}

export async function fetchPublicTags(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let tags = [...store.tags];

  if (params?.search) {
    const s = params.search.toLowerCase();
    tags = tags.filter((t) => t.name.toLowerCase().includes(s));
  }

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '100');
  const total = tags.length;
  const start = (page - 1) * limit;
  const paged = tags.slice(start, start + limit);

  return {
    success: true,
    message: 'Tags fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Tag>;
}

export async function fetchPostsByCategory(slug: string, params?: Record<string, string>) {
  return fetchPublicPosts({ category: slug, ...params });
}

export async function fetchPostsByTag(slug: string, params?: Record<string, string>) {
  return fetchPublicPosts({ tag: slug, ...params });
}

export async function searchPublicPosts(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let posts = store.posts.filter((p) => p.status === 'published' && p.visibility === 'public');

  if (params?.q) {
    const q = params.q.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q),
    );
  }

  posts.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = posts.length;
  const start = (page - 1) * limit;
  const paged = posts.slice(start, start + limit);

  return {
    success: true,
    message: 'Posts found',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Post>;
}
