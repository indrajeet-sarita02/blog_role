'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';

interface GuardContentProps {
  permission: string | string[];
  match?: 'any' | 'all';
  children: ReactNode;
}

export function RequirePermission({ permission, match = 'any', children }: GuardContentProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const perms = usePermissions();
  const requirements = Array.isArray(permission) ? permission : [permission];
  const allowed = match === 'all' ? perms.hasAll(...requirements) : perms.hasAny(...requirements);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return <PageLoader />;
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Alert type="info">
          <p className="font-semibold text-gray-900">Access denied</p>
          <p className="mt-1">
            You don&apos;t have permission to view this page. Contact an administrator if you
            believe this is a mistake.
          </p>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
