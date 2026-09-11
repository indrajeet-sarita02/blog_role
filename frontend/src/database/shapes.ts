import { Prisma } from '@prisma/client';
import { prisma } from '@/database/prisma';

export const memberUserSelect = {
  id: true, name: true, email: true, avatar: true, bio: true, status: true,
} as const;

export const publicUserSelect = {
  id: true, name: true, email: true, avatar: true, bio: true, status: true,
  emailVerifiedAt: true, lastLoginAt: true, createdAt: true, updatedAt: true,
} as const;

export async function getUserWithRoles(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  if (!user) return null;
  return attachRoles(user);
}

export async function attachRoles<T extends { id: number }>(record: T) {
  const roles = await prisma.role.findMany({
    where: { users: { some: { userId: record.id } } },
    orderBy: { id: 'asc' },
    select: {
      id: true, name: true, slug: true, description: true, isSystem: true,
      createdAt: true, updatedAt: true,
    },
  });
  return { ...record, roles };
}

export async function attachPermissions<T extends { id: number }>(record: T) {
  const permissions = await prisma.permission.findMany({
    where: { roles: { some: { roleId: record.id } } },
    orderBy: [{ module: 'asc' }, { id: 'asc' }],
    select: {
      id: true, name: true, slug: true, module: true, description: true,
      createdAt: true, updatedAt: true,
    },
  });
  return { ...record, permissions };
}

const postWithRelations = Prisma.validator<Prisma.PostArgs>()({
  include: {
    author: { select: memberUserSelect },
    category: true,
    tags: { include: { tag: true } },
  },
});

export type PostWithRelations = Prisma.PostGetPayload<typeof postWithRelations>;

export function shapePost(post: PostWithRelations) {
  const { tags, ...rest } = post;
  return { ...rest, tags: tags.map((pt) => pt.tag) };
}

const commentWithUser = Prisma.validator<Prisma.CommentArgs>()({
  include: { user: { select: memberUserSelect } },
});

export type CommentWithUser = Prisma.CommentGetPayload<typeof commentWithUser>;

const mediaWithUser = Prisma.validator<Prisma.MediaArgs>()({
  include: { user: { select: memberUserSelect } },
});

export type MediaWithUser = Prisma.MediaGetPayload<typeof mediaWithUser>;

const auditWithUser = Prisma.validator<Prisma.AuditLogArgs>()({
  include: { user: { select: memberUserSelect } },
});

export type AuditWithUser = Prisma.AuditLogGetPayload<typeof auditWithUser>;