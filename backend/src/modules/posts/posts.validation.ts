import { z } from 'zod';
import { POST_STATUS, POST_VISIBILITY } from '@config/constants';

const statusValues = Object.values(POST_STATUS) as [string, ...string[]];
const visibilityValues = Object.values(POST_VISIBILITY) as [string, ...string[]];

export const idParamSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
});

export const listPostsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    status: z.enum(statusValues).optional(),
    categoryId: z.string().regex(/^\d+$/).optional(),
    authorId: z.string().regex(/^\d+$/).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

const postFields = {
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  slug: z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes')
    .optional(),
  excerpt: z.string().max(2000).nullable().optional(),
  content: z.string().nullable().optional(),
  featuredImage: z.string().max(255).nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
  visibility: z.enum(visibilityValues).optional(),
};

export const createPostSchema = z.object({
  body: z.object({
    ...postFields,
    status: z.enum([POST_STATUS.DRAFT, POST_STATUS.PENDING_REVIEW]).optional(),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
  body: z.object({
    title: postFields.title.optional(),
    slug: postFields.slug,
    excerpt: postFields.excerpt,
    content: postFields.content,
    featuredImage: postFields.featuredImage,
    categoryId: postFields.categoryId,
    tagIds: postFields.tagIds,
    visibility: postFields.visibility,
  }),
});

export const revisionParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid id'),
    revisionId: z.string().regex(/^\d+$/, 'Invalid revision id'),
  }),
});
