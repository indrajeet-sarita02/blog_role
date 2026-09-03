'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import { fetchComments, approveComment, rejectComment, deleteComment } from '@/lib/api/comments';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { extractErrorMessage } from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils/format';
import { usePermissions } from '@/hooks/usePermissions';

export default function CommentsModerationPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const comments = useQuery({
    queryKey: ['comments', { page, status }],
    queryFn: () =>
      fetchComments({
        page: String(page),
        limit: '20',
        ...(status ? { status } : {}),
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comments'] });

  const approve = useMutation({
    mutationFn: (id: number) => approveComment(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });
  const reject = useMutation({
    mutationFn: (id: number) => rejectComment(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });
  const del = useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
          <p className="mt-1 text-sm text-gray-500">Review and moderate user comments.</p>
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'spam', label: 'Spam' },
          ]}
          className="w-40"
        />
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All comments</CardTitle>
        </CardHeader>
        <CardBody>
          {comments.isLoading ? (
            <PageLoader />
          ) : comments.data?.data.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">No comments found.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {comments.data?.data.map((comment) => (
                <li key={comment.id} className="py-4">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-gray-900">{comment.user?.name ?? 'User'}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(comment.createdAt)}</span>
                    <Badge status={comment.status} />
                    <Link
                      href={`/dashboard/posts/${comment.postId}/edit`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Post #{comment.postId}
                    </Link>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                  <div className="mt-2 flex gap-2">
                    {has('comment.approve') && comment.status !== 'approved' && (
                      <Button size="sm" variant="secondary" onClick={() => approve.mutate(comment.id)}>
                        Approve
                      </Button>
                    )}
                    {has('comment.reject') && comment.status !== 'rejected' && comment.status !== 'spam' && (
                      <Button size="sm" variant="danger" onClick={() => reject.mutate(comment.id)}>
                        Reject
                      </Button>
                    )}
                    {(has('comment.delete') || has('comment.deleteAny')) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Delete this comment?')) del.mutate(comment.id);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {comments.data?.meta && (
            <div className="mt-4">
              <Pagination meta={comments.data.meta} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}