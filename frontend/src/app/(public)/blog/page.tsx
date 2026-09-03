'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@/lib/auth/Providers';
import { fetchPublicPosts } from '@/lib/api/public';
import { PostCard } from '@/components/blog/PostCard';
import { Sidebar } from '@/components/blog/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { Alert } from '@/components/ui/Alert';

export default function BlogListPage() {
  const [page, setPage] = useState(1);
  const posts = useQuery({
    queryKey: ['public-blog', { page, limit: 12 }],
    queryFn: () => fetchPublicPosts({ page: String(page), limit: '12' }),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <p className="mt-1 text-sm text-gray-500">All published articles.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {posts.isLoading ? (
            <PageLoader />
          ) : posts.isError ? (
            <Alert type="error">Unable to load posts.</Alert>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.data?.data.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              {posts.data?.data.length === 0 && (
                <p className="py-12 text-center text-gray-500">
                  No posts yet.{' '}
                  <Link href="/dashboard/posts" className="text-blue-600 hover:underline">
                    Create one
                  </Link>
                  .
                </p>
              )}
              {posts.data?.meta && <Pagination meta={posts.data.meta} onPageChange={setPage} />}
            </>
          )}
        </div>
        <aside className="lg:col-span-1">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}