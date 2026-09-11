import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  __blogPrisma?: ReturnType<typeof createClient>;
};

function createClient() {
  return new PrismaClient().$extends(withAccelerate());
}

export const prisma = globalForPrisma.__blogPrisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__blogPrisma = prisma;
}