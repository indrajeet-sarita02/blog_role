import { z } from 'zod';

export const slugParamSchema = z.object({
  params: z.object({ slug: z.string().min(1).max(255) }),
});

export const listPublicSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    tag: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1).max(255),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
