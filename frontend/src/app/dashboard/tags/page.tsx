'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import { fetchTags, createTag, updateTag, deleteTag } from '@/lib/api/tags';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { extractErrorMessage } from '@/lib/api/client';
import { usePermissions } from '@/hooks/usePermissions';
import { Tag } from '@/types';

export default function TagsPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');

  const tags = useQuery({
    queryKey: ['tags', { page }],
    queryFn: () => fetchTags({ page: String(page), limit: '20' }),
    enabled: has('tag.view'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tags'] });

  const createM = useMutation({
    mutationFn: () => createTag({ name: newName }),
    onSuccess: () => {
      setNewName('');
      setError(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const editM = useMutation({
    mutationFn: () => updateTag(editing!.id, editName),
    onSuccess: () => {
      setEditing(null);
      setEditName('');
      setError(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <p className="mt-1 text-sm text-gray-500">Tag posts for quick discovery.</p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {has('tag.create') && !editing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>New tag</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                createM.mutate();
              }}
            >
              <Input
                label="Name"
                value={newName}
                required
                onChange={(e) => setNewName(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" loading={createM.isLoading} disabled={!newName.trim()}>
                Add tag
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {editing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit tag</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                editM.mutate();
              }}
            >
              <Input
                label="Name"
                value={editName}
                required
                onChange={(e) => setEditName(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" loading={editM.isLoading} disabled={!editName.trim()}>
                Save changes
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All tags</CardTitle>
        </CardHeader>
        <CardBody className="px-0">
          {tags.isLoading ? (
            <PageLoader />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Slug</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tags.data?.data.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-gray-500">
                        No tags yet.
                      </td>
                    </tr>
                  )}
                  {tags.data?.data.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{tag.name}</td>
                      <td className="px-5 py-3">
                        <Badge status={tag.slug} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          {has('tag.update') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditing(tag);
                                setEditName(tag.name);
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          {has('tag.delete') && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Delete tag "${tag.name}"?`)) deleteM.mutate(tag.id);
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

          {tags.data?.meta && (
            <div className="px-5 pb-4">
              <Pagination meta={tags.data.meta} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}