'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import {
  fetchPost,
  updatePost,
  submitPostForReview,
  approvePost,
  rejectPost,
  publishPost,
  archivePost,
  fetchPostRevisions,
  restoreRevision,
  PostPayload,
} from '@/lib/api/posts';
import { PostForm } from '@/components/forms/PostForm';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { extractErrorMessage } from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils/format';
import { usePermissions } from '@/hooks/usePermissions';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const postId = Number(params.id);
  const queryClient = useQueryClient();
  const { has, hasAny } = usePermissions();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const post = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
    retry: false,
    enabled: Number.isInteger(postId),
  });
  const revisions = useQuery({
    queryKey: ['revisions', postId],
    queryFn: () => fetchPostRevisions(postId),
    enabled: Number.isInteger(postId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['post', postId] });
    queryClient.invalidateQueries({ queryKey: ['revisions', postId] });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: PostPayload) => updatePost(postId, payload),
    onSuccess: () => {
      setError(null);
      setSuccess('Post updated successfully.');
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const workflowMutations = {
    review: useMutation({
      mutationFn: () => submitPostForReview(postId),
      onSuccess: () => {
        setSuccess('Post submitted for review.');
        invalidate();
      },
      onError: (err) => setError(extractErrorMessage(err)),
    }),
    approve: useMutation({
      mutationFn: () => approvePost(postId),
      onSuccess: () => {
        setSuccess('Post approved.');
        invalidate();
      },
      onError: (err) => setError(extractErrorMessage(err)),
    }),
    reject: useMutation({
      mutationFn: () => rejectPost(postId, ''),
      onSuccess: () => {
        setSuccess('Post rejected.');
        invalidate();
      },
      onError: (err) => setError(extractErrorMessage(err)),
    }),
    publish: useMutation({
      mutationFn: () => publishPost(postId),
      onSuccess: () => {
        setSuccess('Post published.');
        invalidate();
      },
      onError: (err) => setError(extractErrorMessage(err)),
    }),
    archive: useMutation({
      mutationFn: () => archivePost(postId),
      onSuccess: () => {
        setSuccess('Post archived.');
        invalidate();
      },
      onError: (err) => setError(extractErrorMessage(err)),
    }),
  };

  const restoreMutation = useMutation({
    mutationFn: (revisionId: number) => restoreRevision(postId, revisionId),
    onSuccess: () => {
      setSuccess('Revision restored.');
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  if (post.isLoading) return <PageLoader />;
  if (post.isError) {
    return (
      <div className="mx-auto max-w-2xl py-16">
        <Alert type="error">Unable to load this post.</Alert>
        <div className="mt-4">
          <Link href="/dashboard/posts" className="text-sm text-blue-600 hover:underline">
            ← Back to posts
          </Link>
        </div>
      </div>
    );
  }

  const data = post.data;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit post</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/blog/${data?.slug}`} className="text-blue-600 hover:underline">
              View on site
            </Link>
            <span>·</span>
            <Badge status={data?.status ?? ''} />
            <Badge status={data?.visibility ?? ''} />
          </div>
        </div>
        <Link href="/dashboard/posts">
          <Button variant="ghost" size="sm">
            ← Back to posts
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success">{success}</Alert>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {data?.status === 'draft' && has('blog.update') && (
          <Button size="sm" onClick={() => workflowMutations.review.mutate()} loading={workflowMutations.review.isLoading}>
            Submit for review
          </Button>
        )}
        {data?.status === 'pending_review' && has('blog.approve') && (
          <Button size="sm" variant="secondary" onClick={() => workflowMutations.approve.mutate()} loading={workflowMutations.approve.isLoading}>
            Approve
          </Button>
        )}
        {data?.status === 'pending_review' && has('blog.reject') && (
          <Button size="sm" variant="danger" onClick={() => workflowMutations.reject.mutate()} loading={workflowMutations.reject.isLoading}>
            Reject
          </Button>
        )}
        {data?.status === 'approved' && has('blog.publish') && (
          <Button size="sm" onClick={() => workflowMutations.publish.mutate()} loading={workflowMutations.publish.isLoading}>
            Publish
          </Button>
        )}
        {hasAny('blog.archive') && ['published', 'rejected'].includes(data?.status ?? '') && (
          <Button size="sm" variant="outline" onClick={() => workflowMutations.archive.mutate()} loading={workflowMutations.archive.isLoading}>
            Archive
          </Button>
        )}
      </div>

      {data && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Post details</CardTitle>
          </CardHeader>
          <CardBody>
            <PostForm
              mode="edit"
              initial={data}
              isSubmitting={updateMutation.isLoading}
              error={undefined}
              onSubmit={(payload) => updateMutation.mutate(payload)}
            />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Revisions</CardTitle>
        </CardHeader>
        <CardBody>
          {revisions.isLoading ? (
            <PageLoader />
          ) : revisions.data?.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No revisions yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {revisions.data?.map((revision) => (
                <li key={revision.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Revision #{revision.revisionNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {revision.title} · {formatDateTime(revision.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Restore revision #${revision.revisionNumber}?`)) {
                        restoreMutation.mutate(revision.id);
                      }
                    }}
                    loading={restoreMutation.isLoading}
                  >
                    Restore
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}