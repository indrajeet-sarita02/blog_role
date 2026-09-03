'use client';

import Link from 'next/link';
import { useQuery } from '@/lib/auth/Providers';
import { useAuth } from '@/lib/auth/AuthProvider';
import { fetchMyPosts } from '@/lib/api/posts';
import { fetchComments } from '@/lib/api/comments';
import { fetchMedia } from '@/lib/api/media';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/format';
import { usePermissions } from '@/hooks/usePermissions';

export default function DashboardOverview() {
  const { user, isAuthenticated } = useAuth();
  const { has } = usePermissions();

  const myPosts = useQuery({
    queryKey: ['my-posts', { page: '1', limit: '5' }],
    queryFn: () => fetchMyPosts(user!.id, { page: '1', limit: '5' }),
    enabled: isAuthenticated && !!user,
  });
  const comments = useQuery({
    queryKey: ['admin-comments', { page: '1', limit: '5' }],
    queryFn: () => fetchComments({ page: '1', limit: '5' }),
  });
  const media = useQuery({
    queryKey: ['media', { page: '1', limit: '1' }],
    queryFn: () => fetchMedia({ page: '1', limit: '1' }),
    enabled: has('media.view'),
  });

  const stats = [
    { label: 'My Posts', value: myPosts.data?.meta.total ?? '—', href: '/dashboard/posts' },
    { label: 'Recent Comments', value: comments.data?.meta.total ?? '—', href: '/dashboard/comments' },
    { label: 'Media Files', value: media.data?.meta.total ?? '—', href: '/dashboard/media' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name ?? 'there'}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">Manage your blog content from here.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardBody>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Posts</CardTitle>
          <Link href="/dashboard/posts/new" className="text-sm font-medium text-blue-600 hover:underline">
            + New post
          </Link>
        </CardHeader>
        <CardBody>
          {myPosts.isLoading ? (
            <PageLoader />
          ) : myPosts.data?.data.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              You haven&apos;t written any posts yet.{' '}
              <Link href="/dashboard/posts/new" className="text-blue-600 hover:underline">
                Write your first post
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {myPosts.data?.data.map((post) => (
                <li key={post.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/posts/${post.id}/edit`}
                      className="block truncate font-medium text-gray-900 hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-500">{formatDate(post.updatedAt)}</p>
                  </div>
                  <Badge status={post.status} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}