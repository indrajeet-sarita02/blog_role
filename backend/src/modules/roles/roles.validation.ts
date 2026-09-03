import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
    description: z.string().max(2000).nullable().optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(2000).nullable().optional(),
  }),
});

export const roleIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
});

export const listRolesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const updateRolePermissionsSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
  body: z.object({
    permissionIds: z.array(z.number().int().positive()).min(1, 'At least one permission required'),
  }),
});
