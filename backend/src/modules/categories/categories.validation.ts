import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    slug: z
      .string()
      .min(2)
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes')
      .optional(),
    description: z.string().max(2000).nullable().optional(),
    parentId: z.number().int().positive().nullable().optional(),
    status: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(2000).nullable().optional(),
    parentId: z.number().int().positive().nullable().optional(),
    status: z.string().optional(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
});

export const listCategoriesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
