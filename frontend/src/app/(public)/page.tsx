'use client';

import { useState } from 'react';
import { useQuery } from '@/lib/auth/Providers';
import { fetchPublicPosts } from '@/lib/api/public';
import { PostCard } from '@/components/blog/PostCard';
import { Sidebar } from '@/components/blog/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { Alert } from '@/components/ui/Alert';

export default function HomePage() {
  const [page, setPage] = useState(1);
  const posts = useQuery({
    queryKey: ['public-posts', { page, limit: 9 }],
    queryFn: () => fetchPublicPosts({ page: String(page), limit: '9' }),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Welcome to My Blog</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          A production blog with articles, categories, tags, comments, and a full admin dashboard.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {posts.isLoading ? (
            <PageLoader />
          ) : posts.isError ? (
            <Alert type="error">Unable to load posts. Make sure the API server is running.</Alert>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.data?.data.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              {posts.data?.data.length === 0 && (
                <p className="py-12 text-center text-gray-500">No posts published yet.</p>
              )}
              {posts.data?.meta && (
                <Pagination meta={posts.data.meta} onPageChange={setPage} />
              )}
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