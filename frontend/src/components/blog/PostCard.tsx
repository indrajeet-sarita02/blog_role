'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate, stripHtml } from '@/lib/utils/format';

export function PostCard({ post }: { post: Post }) {
  const excerpt = stripHtml(post.excerpt ?? post.content ?? '').slice(0, 180);

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {post.featuredImage && (
        <Link href={`/blog/${post.slug}`} className="block aspect-video w-full overflow-hidden bg-gray-100">
          <Image
            src={post.featuredImage}
            alt={post.title}
            width={800}
            height={450}
            className="h-full w-full object-cover"
          />
        </Link>
      )}
      <div className="p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {post.category && (
            <Link
              href={`/category/${post.category.slug}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {post.category.name}
            </Link>
          )}
          <span>·</span>
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          {post.author && (
            <>
              <span>·</span>
              <span>By {post.author.name}</span>
            </>
          )}
        </div>
        <h2 className="text-lg font-semibold leading-snug text-gray-900">
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
            {post.title}
          </Link>
        </h2>
        {excerpt && <p className="mt-2 line-clamp-3 text-sm text-gray-600">{excerpt}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}