'use client';

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useQuery } from '@/lib/auth/Providers';
import { fetchPublicPost } from '@/lib/api/public';
import { CommentSection } from '@/components/comments/CommentSection';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/utils/format';

export default function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = useQuery({
    queryKey: ['public-post', params.slug],
    queryFn: () => fetchPublicPost(params.slug),
    retry: false,
  });

  if (post.isLoading) return <PageLoader />;

  if (post.isError) {
    const status = (post.error as { response?: { status?: number } } | undefined)?.response?.status;
    if (status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Alert type="error">This post is not available.</Alert>
        <div className="mt-4">
          <Link href="/blog" className="text-sm text-blue-600 hover:underline">
            ← Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const data = post.data;
  if (!data) return null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-3 text-xs text-gray-500">
        <Link href="/blog" className="text-blue-600 hover:underline">
          Blog
        </Link>
        {data.category && (
          <>
            {' '}
            /{' '}
            <Link href={`/category/${data.category.slug}`} className="text-blue-600 hover:underline">
              {data.category.name}
            </Link>
          </>
        )}
      </div>

      <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">{data.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        {data.author && <span>By {data.author.name}</span>}
        <span>·</span>
        <span>{formatDate(data.publishedAt ?? data.createdAt)}</span>
      </div>

      {data.tags && data.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.tags.map((tag) => (
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

      {data.featuredImage && (
        <div className="mt-6 overflow-hidden rounded-lg">
          <Image
            src={data.featuredImage}
            alt={data.title}
            width={1024}
            height={576}
            className="w-full object-cover"
          />
        </div>
      )}

      <div
        className="prose-content mt-8 text-gray-800"
        dangerouslySetInnerHTML={{ __html: data.content ?? '' }}
      />

      <div className="mt-12 border-t border-gray-200 pt-8">
        <CommentSection postId={data.id} />
      </div>
    </article>
  );
}