'use client';

import { useState } from 'react';
import { useQuery } from '@/lib/auth/Providers';
import { fetchPostsByCategory, fetchPublicCategory } from '@/lib/api/public';
import { PostCard } from '@/components/blog/PostCard';
import { Sidebar } from '@/components/blog/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { Alert } from '@/components/ui/Alert';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [page, setPage] = useState(1);
  const posts = useQuery({
    queryKey: ['category-posts', params.slug, { page, limit: 12 }],
    queryFn: () => fetchPostsByCategory(params.slug, { page: String(page), limit: '12' }),
  });
  const category = useQuery({
    queryKey: ['public-category', params.slug],
    queryFn: () => fetchPublicCategory(params.slug),
    retry: false,
  });

  if (category.isError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Alert type="error">
          <p className="font-semibold text-gray-900">Category not found</p>
          <p className="mt-1">The category &ldquo;{params.slug}&rdquo; doesn&apos;t exist or has no public listing.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold capitalize text-gray-900">
          {category.data ? category.data.name : params.slug}
        </h1>
        {category.data?.description && (
          <p className="mt-1 text-sm text-gray-500">{category.data.description}</p>
        )}
      </div>
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {posts.isLoading ? (
            <PageLoader />
          ) : posts.isError ? (
            <Alert type="error">Unable to load posts for this category.</Alert>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.data?.data.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              {posts.data?.data.length === 0 && (
                <p className="py-12 text-center text-gray-500">No posts in this category.</p>
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