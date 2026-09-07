import { getStore, saveStore, delay, makeSlug, nextId } from '@/lib/mock/store';
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
  await delay();
  const store = getStore();
  let posts = [...store.posts];

  if (params?.authorId) posts = posts.filter((p) => p.authorId === parseInt(params.authorId));
  if (params?.status) posts = posts.filter((p) => p.status === params.status);
  if (params?.search) {
    const s = params.search.toLowerCase();
    posts = posts.filter(
      (p) => p.title.toLowerCase().includes(s) || p.excerpt?.toLowerCase().includes(s),
    );
  }

  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

export async function fetchPost(id: number) {
  await delay();
  const store = getStore();
  const post = store.posts.find((p) => p.id === id);
  if (!post) throw new Error('Post not found');
  return post;
}

export async function fetchMyPosts(authorId: number, params?: Record<string, string>) {
  return fetchPosts({ authorId: String(authorId), ...params });
}

export async function createPost(payload: PostPayload) {
  await delay();
  const store = getStore();
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem('blog_access_token') : null;
  if (!raw) throw new Error('Not authenticated');
  const payload_data = JSON.parse(atob(raw));

  const slug = payload.slug || makeSlug(payload.title);
  const tags = payload.tagIds ? store.tags.filter((t) => payload.tagIds!.includes(t.id)) : [];
  const category = payload.categoryId
    ? store.categories.find((c) => c.id === payload.categoryId)
    : null;
  const author = store.users.find((u) => u.id === payload_data.userId);

  const now = new Date().toISOString();
  const post: Post = {
    id: nextId(store, 'post'),
    authorId: payload_data.userId,
    categoryId: payload.categoryId || null,
    title: payload.title,
    slug,
    excerpt: payload.excerpt || null,
    content: payload.content || null,
    featuredImage: payload.featuredImage || null,
    status: payload.status || 'draft',
    visibility: payload.visibility || 'public',
    publishedAt: payload.status === 'published' ? now : null,
    createdAt: now,
    updatedAt: now,
    author: author ? { id: author.id, name: author.name, email: author.email, avatar: null, bio: null, status: 'active' } : undefined,
    category: category || null,
    tags,
  };

  store.posts.push(post);
  saveStore(store);
  return post;
}

export async function updatePost(id: number, payload: PostPayload) {
  await delay();
  const store = getStore();
  const post = store.posts.find((p) => p.id === id);
  if (!post) throw new Error('Post not found');

  if (payload.title !== undefined) post.title = payload.title;
  if (payload.slug !== undefined) post.slug = payload.slug;
  if (payload.content !== undefined) post.content = payload.content;
  if (payload.excerpt !== undefined) post.excerpt = payload.excerpt;
  if (payload.categoryId !== undefined) post.categoryId = payload.categoryId;
  if (payload.featuredImage !== undefined) post.featuredImage = payload.featuredImage;
  if (payload.status !== undefined) post.status = payload.status;
  if (payload.visibility !== undefined) post.visibility = payload.visibility;

  if (payload.tagIds) {
    post.tags = store.tags.filter((t) => payload.tagIds!.includes(t.id));
  }
  if (payload.categoryId) {
    post.category = store.categories.find((c) => c.id === payload.categoryId) || null;
  }

  post.updatedAt = new Date().toISOString();
  saveStore(store);
  return post;
}

export async function deletePost(id: number) {
  await delay();
  const store = getStore();
  store.posts = store.posts.filter((p) => p.id !== id);
  store.comments = store.comments.filter((c) => c.postId !== id);
  store.postRevisions = store.postRevisions.filter((r) => r.postId !== id);
  saveStore(store);
}

async function transitionPost(id: number, status: PostStatus): Promise<Post> {
  const store = getStore();
  const post = store.posts.find((p) => p.id === id);
  if (!post) throw new Error('Post not found');
  post.status = status;
  if (status === 'published') post.publishedAt = new Date().toISOString();
  post.updatedAt = new Date().toISOString();
  saveStore(store);
  return post;
}

export async function submitPostForReview(id: number) {
  return transitionPost(id, 'pending_review');
}

export async function approvePost(id: number) {
  return transitionPost(id, 'approved');
}

export async function rejectPost(id: number, _reason: string) {
  return transitionPost(id, 'rejected');
}

export async function publishPost(id: number) {
  return transitionPost(id, 'published');
}

export async function archivePost(id: number) {
  return transitionPost(id, 'archived');
}

export async function fetchPostRevisions(id: number) {
  await delay();
  const store = getStore();
  const revisions = store.postRevisions.filter((r) => r.postId === id);
  return revisions;
}

export async function restoreRevision(id: number, revisionId: number) {
  await delay();
  const store = getStore();
  const revision = store.postRevisions.find((r) => r.id === revisionId && r.postId === id);
  if (!revision) throw new Error('Revision not found');
  const post = store.posts.find((p) => p.id === id);
  if (!post) throw new Error('Post not found');

  post.title = revision.title;
  post.excerpt = revision.excerpt;
  post.content = revision.content;
  post.featuredImage = revision.featuredImage;
  post.updatedAt = new Date().toISOString();
  saveStore(store);
  return post;
}
