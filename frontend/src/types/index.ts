export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount?: number;
}

export interface ApiErrorShape {
  success: false;
  message: string;
  error: {
    code: string;
    details: unknown;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  status: string;
  createdAt?: string;
  roles?: Array<{
    id: number;
    name: string;
    slug: string;
    permissions?: Permission[];
  }>;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isSystem?: boolean;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  module: string;
  description?: string | null;
}

export interface Category {
  id: number;
  parentId?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  status?: string;
  children?: Category[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export type PostStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'archived';

export interface Post {
  id: number;
  authorId: number;
  categoryId?: number | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  status: PostStatus;
  visibility: 'public' | 'private';
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
  category?: Category | null;
  tags?: Tag[];
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  parentId?: number | null;
  content: string;
  status: string;
  createdAt: string;
  user?: User;
  replies?: Comment[];
}

export interface Media {
  id: number;
  userId: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  altText?: string | null;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message?: string | null;
  data?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PostRevision {
  id: number;
  postId: number;
  userId: number;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  revisionNumber: number;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}