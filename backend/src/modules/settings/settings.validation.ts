import { z } from 'zod';

export const listSettingsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const updateSettingsSchema = z.object({
  body: z.record(z.string(), z.unknown()),
});