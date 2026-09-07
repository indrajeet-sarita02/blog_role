import { getStore, saveStore, delay, nextId } from '@/lib/mock/store';
import { ApiListResponse, ApiResponse, Comment } from '@/types';

export async function fetchComments(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let comments = [...store.comments];

  if (params?.postId) comments = comments.filter((c) => c.postId === parseInt(params.postId));
  if (params?.status) comments = comments.filter((c) => c.status === params.status);

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = comments.length;
  const start = (page - 1) * limit;
  const paged = comments.slice(start, start + limit);

  return {
    success: true,
    message: 'Comments fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Comment>;
}

export async function fetchPostComments(postId: number) {
  await delay();
  const store = getStore();
  const comments = store.comments.filter(
    (c) => c.postId === postId && c.status === 'approved',
  );

  return {
    success: true,
    message: 'Comments fetched',
    data: comments,
    meta: { page: 1, limit: 100, total: comments.length, totalPages: 1 },
  } as ApiListResponse<Comment>;
}

export async function createComment(
  postId: number,
  payload: { content: string; parentId?: number | null },
) {
  await delay();
  const store = getStore();
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem('blog_access_token') : null;
  if (!raw) throw new Error('Not authenticated');
  const tokenPayload = JSON.parse(atob(raw));
  const user = store.users.find((u) => u.id === tokenPayload.userId);

  const comment: Comment = {
    id: nextId(store, 'comment'),
    postId,
    userId: tokenPayload.userId,
    parentId: payload.parentId || null,
    content: payload.content,
    status: 'approved',
    createdAt: new Date().toISOString(),
    user: user
      ? { id: user.id, name: user.name, email: user.email, avatar: null, bio: null, status: 'active' }
      : undefined,
  };

  store.comments.push(comment);
  saveStore(store);
  return comment;
}

export async function updateComment(id: number, content: string) {
  await delay();
  const store = getStore();
  const comment = store.comments.find((c) => c.id === id);
  if (!comment) throw new Error('Comment not found');
  comment.content = content;
  saveStore(store);
  return comment;
}

export async function deleteComment(id: number) {
  await delay();
  const store = getStore();
  store.comments = store.comments.filter((c) => c.id !== id);
  saveStore(store);
}

export async function approveComment(id: number) {
  await delay();
  const store = getStore();
  const comment = store.comments.find((c) => c.id === id);
  if (!comment) throw new Error('Comment not found');
  comment.status = 'approved';
  saveStore(store);
  return comment;
}

export async function rejectComment(id: number) {
  await delay();
  const store = getStore();
  const comment = store.comments.find((c) => c.id === id);
  if (!comment) throw new Error('Comment not found');
  comment.status = 'rejected';
  saveStore(store);
  return comment;
}
