import { useMemo } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';

export interface ActorPermissions {
  permissions: Set<string>;
  roles: string[];
  has: (permission: string) => boolean;
  hasAny: (...permissions: string[]) => boolean;
  hasAll: (...permissions: string[]) => boolean;
}

export function usePermissions(): ActorPermissions {
  const { user } = useAuth();

  return useMemo(() => {
    const slugs = new Set<string>();
    const roleSlugs: string[] = [];
    for (const role of user?.roles ?? []) {
      roleSlugs.push(role.slug);
      for (const permission of role.permissions ?? []) {
        slugs.add(permission.slug);
      }
    }
    return {
      permissions: slugs,
      roles: roleSlugs,
      has: (p: string) => slugs.has(p),
      hasAny: (...ps: string[]) => ps.some((p) => slugs.has(p)),
      hasAll: (...ps: string[]) => ps.every((p) => slugs.has(p)),
    };
  }, [user]);
}