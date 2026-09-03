'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import {
  fetchCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  CategoryPayload,
} from '@/lib/api/categories';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { extractErrorMessage } from '@/lib/api/client';
import { slugify } from '@/lib/utils/format';
import { usePermissions } from '@/hooks/usePermissions';
import { Category } from '@/types';

const emptyForm = { name: '', slug: '', description: '', parentId: '', status: 'active' };

export default function CategoriesPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const categories = useQuery({
    queryKey: ['categories', { page }],
    queryFn: () => fetchCategoryList({ page: String(page), limit: '20' }),
    enabled: has('category.view'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const createM = useMutation({
    mutationFn: () => {
      const payload: CategoryPayload = {
        name: form.name,
        description: form.description || null,
        status: form.status || undefined,
      };
      if (form.slug.trim()) payload.slug = form.slug.trim();
      if (form.parentId) payload.parentId = Number(form.parentId);
      return createCategory(payload);
    },
    onSuccess: () => {
      setForm(emptyForm);
      setError(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const editM = useMutation({
    mutationFn: () => {
      const payload: Partial<CategoryPayload> = {
        name: form.name,
        description: form.description || null,
        status: form.status || undefined,
      };
      if (form.parentId) payload.parentId = Number(form.parentId);
      else payload.parentId = null;
      return updateCategory(editingId!, payload);
    },
    onSuccess: () => {
      setForm(emptyForm);
      setEditingId(null);
      setFormMode('create');
      setError(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const startEdit = (cat: Category) => {
    setFormMode('edit');
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      parentId: cat.parentId ? String(cat.parentId) : '',
      status: cat.status ?? 'active',
    });
  };

  const cancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormMode('create');
  };

  const parentOptions = [
    { value: '', label: 'None (top level)' },
    ...(categories.data?.data ?? [])
      .filter((c) => !editingId || c.id !== editingId)
      .map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">Organize posts into categories.</p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {has('category.create') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{formMode === 'create' ? 'New category' : 'Edit category'}</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                formMode === 'create' ? createM.mutate() : editM.mutate();
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Name"
                  value={form.name}
                  required
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value, slug: formMode === 'create' ? slugify(e.target.value) : f.slug }))
                  }
                />
                <Input
                  label="Slug"
                  value={form.slug}
                  disabled={formMode === 'edit'}
                  placeholder="auto-generated from name"
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Parent category"
                  value={form.parentId}
                  options={parentOptions}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                />
                <Select
                  label="Status"
                  value={form.status}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  loading={formMode === 'create' ? createM.isLoading : editM.isLoading}
                  disabled={!form.name}
                >
                  {formMode === 'create' ? 'Create category' : 'Save changes'}
                </Button>
                {formMode === 'edit' && (
                  <Button type="button" variant="ghost" onClick={cancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All categories</CardTitle>
        </CardHeader>
        <CardBody className="px-0">
          {categories.isLoading ? (
            <PageLoader />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Slug</th>
                    <th className="px-5 py-3 font-medium">Parent</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.data?.data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                        No categories yet.
                      </td>
                    </tr>
                  )}
                  {categories.data?.data.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-5 py-3 text-gray-500">{cat.slug}</td>
                      <td className="px-5 py-3 text-gray-500">
                        {categories.data?.data.find((c) => c.id === cat.parentId)?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={cat.status ?? ''} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          {has('category.update') && (
                            <Button variant="outline" size="sm" onClick={() => startEdit(cat)}>
                              Edit
                            </Button>
                          )}
                          {has('category.delete') && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Delete category "${cat.name}"?`)) deleteM.mutate(cat.id);
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

          {categories.data?.meta && (
            <div className="px-5 pb-4">
              <Pagination meta={categories.data.meta} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}