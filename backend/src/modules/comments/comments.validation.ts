import { z } from 'zod';

export const postParamSchema = z.object({
  params: z.object({ postId: z.string().regex(/^\d+$/, 'Invalid post id') }),
});

export const createCommentSchema = z.object({
  params: z.object({ postId: z.string().regex(/^\d+$/, 'Invalid post id') }),
  body: z.object({
    content: z.string().min(1, 'Comment content is required').max(5000),
    parentId: z.number().int().positive().nullable().optional(),
  }),
});

export const commentIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
});

export const updateCommentSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
  body: z.object({
    content: z.string().min(1).max(5000),
  }),
});

export const listCommentsSchema = z.object({
  params: z.object({ postId: z.string().regex(/^\d+$/, 'Invalid post id') }),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const listAllCommentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.string().optional(),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
