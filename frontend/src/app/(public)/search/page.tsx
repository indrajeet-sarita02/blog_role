'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@/lib/auth/Providers';
import { searchPublicPosts } from '@/lib/api/public';
import { PostCard } from '@/components/blog/PostCard';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const router = useRouter();
  const query = searchParams?.q ?? '';
  const [input, setInput] = useState(query);

  const results = useQuery({
    queryKey: ['search-posts', query],
    queryFn: () => searchPublicPosts({ q: query, limit: '20' }),
    enabled: !!query,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Search</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search articles…"
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {query && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-gray-500">
            Showing results for <span className="font-medium text-gray-800">“{query}”</span>
          </p>
          {results.isLoading ? (
            <PageLoader />
          ) : results.isError ? (
            <Alert type="error">Search failed. Try again later.</Alert>
          ) : results.data?.data.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No results found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {results.data?.data.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}