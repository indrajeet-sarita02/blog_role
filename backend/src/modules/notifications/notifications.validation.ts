import { z } from 'zod';

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    unread: z.enum(['true', 'false']).optional(),
    type: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const notificationIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid id') }),
});