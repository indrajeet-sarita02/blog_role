'use client';

import Link from 'next/link';
import { useQuery } from '@/lib/auth/Providers';
import { fetchPublicCategories, fetchPublicTags } from '@/lib/api/public';

export function Sidebar() {
  const categories = useQuery({ queryKey: ['public-categories'], queryFn: () => fetchPublicCategories() });
  const tags = useQuery({ queryKey: ['public-tags'], queryFn: () => fetchPublicTags() });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Categories
        </h3>
        {categories.isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <ul className="space-y-2">
            {categories.data?.data.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-sm text-gray-700 hover:text-blue-600"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Tags</h3>
        {tags.isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.data?.data.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="rounded bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}