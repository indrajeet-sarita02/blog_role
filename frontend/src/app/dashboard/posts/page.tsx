'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import {
  fetchPosts,
  deletePost,
  submitPostForReview,
  approvePost,
  rejectPost,
  publishPost,
  archivePost,
} from '@/lib/api/posts';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { extractErrorMessage } from '@/lib/api/client';
import { formatDate } from '@/lib/utils/format';
import { usePermissions } from '@/hooks/usePermissions';

export default function PostsAdminPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const posts = useQuery({
    queryKey: ['posts', { page, status, search }],
    queryFn: () =>
      fetchPosts({
        page: String(page),
        limit: '20',
        status,
        ...(search ? { search } : {}),
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['posts'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });
  const reviewMutation = useMutation({
    mutationFn: (id: number) => submitPostForReview(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });
  const approveMutation = useMutation({
    mutationFn: (id: number) => approvePost(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectPost(id, ''),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });
  const publishMutation = useMutation({
    mutationFn: (id: number) => publishPost(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });
  const archiveMutation = useMutation({
    mutationFn: (id: number) => archivePost(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const canManage = has('blog.update') || has('blog.updateAny');

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="mt-1 text-sm text-gray-500">Create, edit, and manage blog posts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'pending_review', label: 'Pending review' },
              { value: 'approved', label: 'Approved' },
              { value: 'published', label: 'Published' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'archived', label: 'Archived' },
            ]}
            className="w-40"
          />
          {has('blog.create') && (
            <Link href="/dashboard/posts/new">
              <Button>+ New post</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search posts…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>All posts</CardTitle>
        </CardHeader>
        <CardBody className="px-0">
          {posts.isLoading ? (
            <PageLoader />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Visibility</th>
                    <th className="px-5 py-3 font-medium">Updated</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.data?.data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                        No posts found.
                      </td>
                    </tr>
                  )}
                  {posts.data?.data.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={post.status} />
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={post.visibility} />
                      </td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(post.updatedAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          {canManage && (
                            <Link href={`/dashboard/posts/${post.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                          )}
                          {post.status === 'draft' && has('blog.update') && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => reviewMutation.mutate(post.id)}
                              loading={reviewMutation.isLoading && reviewMutation.variables === post.id}
                            >
                              Submit review
                            </Button>
                          )}
                          {post.status === 'pending_review' && has('blog.approve') && (
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(post.id)}
                              loading={approveMutation.isLoading && approveMutation.variables === post.id}
                            >
                              Approve
                            </Button>
                          )}
                          {post.status === 'pending_review' && has('blog.reject') && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => rejectMutation.mutate(post.id)}
                              loading={rejectMutation.isLoading && rejectMutation.variables === post.id}
                            >
                              Reject
                            </Button>
                          )}
                          {post.status === 'approved' && has('blog.publish') && (
                            <Button
                              size="sm"
                              onClick={() => publishMutation.mutate(post.id)}
                              loading={publishMutation.isLoading && publishMutation.variables === post.id}
                            >
                              Publish
                            </Button>
                          )}
                          {post.status === 'published' && has('blog.archive') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => archiveMutation.mutate(post.id)}
                            >
                              Archive
                            </Button>
                          )}
                          {(has('blog.delete') || has('blog.deleteAny')) && post.status !== 'archived' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Delete "${post.title}"?`)) deleteMutation.mutate(post.id);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {posts.data?.meta && (
            <div className="px-5 pb-4">
              <Pagination meta={posts.data.meta} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}