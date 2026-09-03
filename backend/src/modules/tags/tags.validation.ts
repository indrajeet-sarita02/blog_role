import { z } from 'zod';

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes')
      .optional(),
  }),
});

export const updateTagSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
  }),
});

export const tagIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
});

export const listTagsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
