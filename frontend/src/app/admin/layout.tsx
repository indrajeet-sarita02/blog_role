'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { PageLoader } from '@/components/ui/Spinner';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return <PageLoader />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
