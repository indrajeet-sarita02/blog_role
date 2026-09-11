import { prisma } from '@/database/prisma';
import { ensureSchema } from '@/database/schema';

export { prisma } from '@/database/prisma';
export { ensureSchema } from '@/database/schema';

const g = globalThis as unknown as { __blogDbReady?: boolean };

export async function ensureDb(): Promise<void> {
  if (g.__blogDbReady) return;

  await ensureSchema();
  await ensureSeeded();

  g.__blogDbReady = true;
}

async function ensureSeeded(): Promise<void> {
  const count = await prisma.user.count();
  if (count > 0) return;

  const { seedDatabase } = await import('@/database/seed');
  await seedDatabase();
}