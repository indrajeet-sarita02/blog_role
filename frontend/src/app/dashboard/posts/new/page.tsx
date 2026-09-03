'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@/lib/auth/Providers';
import { createPost, PostPayload } from '@/lib/api/posts';
import { PostForm } from '@/components/forms/PostForm';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { extractErrorMessage } from '@/lib/api/client';

export default function NewPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: PostPayload) => createPost(payload),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      router.push(`/dashboard/posts/${post.id}/edit`);
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New post</h1>
          <p className="mt-1 text-sm text-gray-500">Write and publish a new blog post.</p>
        </div>
        <Link href="/dashboard/posts">
          <Button variant="ghost" size="sm">
            ← Back to posts
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post details</CardTitle>
        </CardHeader>
        <CardBody>
          <PostForm
            mode="create"
            isSubmitting={mutation.isLoading}
            error={error}
            onSubmit={(payload) => mutation.mutate(payload)}
          />
        </CardBody>
      </Card>
    </div>
  );
}