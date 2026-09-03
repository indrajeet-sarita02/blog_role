import { z } from 'zod';
import { USER_STATUS } from '@config/constants';

const statusValues = Object.values(USER_STATUS) as [string, ...string[]];

export const getUserByIdSchemaOnly = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
  body: z.object({
    name: z.string().min(2).max(255).optional(),
    avatar: z.string().max(255).nullable().optional(),
    bio: z.string().max(2000).nullable().optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
  body: z.object({
    status: z.enum(statusValues),
  }),
});

export const updateUserRolesSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
  body: z.object({
    roleIds: z.array(z.number().int().positive()).min(1, 'At least one role required'),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    status: z.enum(statusValues).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    roleIds: z.array(z.number().int().positive()).optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
});
