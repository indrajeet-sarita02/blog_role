'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@/lib/auth/Providers';
import { fetchNotifications } from '@/lib/api/notifications';

const navGroups: Array<{ title: string; items: { href: string; label: string; permission?: string }[] }> = [
  {
    title: 'Content',
    items: [
      { href: '/dashboard', label: 'Overview' },
      { href: '/dashboard/posts', label: 'Posts' },
      { href: '/dashboard/comments', label: 'Comments' },
      { href: '/dashboard/media', label: 'Media' },
      { href: '/dashboard/profile', label: 'Profile' },
      { href: '/dashboard/notifications', label: 'Notifications' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { href: '/dashboard/categories', label: 'Categories', permission: 'category.view' },
      { href: '/dashboard/tags', label: 'Tags', permission: 'tag.view' },
      { href: '/admin/users', label: 'Users', permission: 'user.view' },
      { href: '/admin/roles', label: 'Roles', permission: 'role.view' },
      { href: '/admin/permissions', label: 'Permissions', permission: 'permission.view' },
      { href: '/admin/audit-logs', label: 'Audit Logs', permission: 'audit.view' },
      { href: '/admin/settings', label: 'Settings', permission: 'settings.view' },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { has } = usePermissions();
  const notifications = useQuery({
    queryKey: ['notifications', { limit: '1' }],
    queryFn: () => fetchNotifications({ limit: '1', sort: 'created_at', order: 'desc' }),
    refetchInterval: 60000,
  });
  const unreadCount = notifications.data?.meta.unreadCount ?? 0;

  const logoutAndRedirect = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="text-lg font-bold text-blue-600">
          Dashboard
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => {
          const visible = group.items.filter((item) => !item.permission || has(item.permission));
          if (visible.length === 0) return null;
          return (
            <div key={group.title} className="mb-5">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group.title}
              </p>
              <div className="space-y-1">
                {visible.map((item) => {
                  const active =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 px-4 py-3">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
            <Link href="/" className="block text-xs text-gray-500 hover:text-blue-600">
              View site
            </Link>
          </div>
        </div>
        <button
          onClick={logoutAndRedirect}
          className="w-full rounded-md px-2 py-1.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}