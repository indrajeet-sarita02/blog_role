'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useQuery } from '@/lib/auth/Providers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { fetchCategoryList } from '@/lib/api/categories';
import { fetchTags } from '@/lib/api/tags';
import { slugify } from '@/lib/utils/format';
import { PostPayload } from '@/lib/api/posts';
import { usePermissions } from '@/hooks/usePermissions';
import { Post } from '@/types';

export interface PostFormValues {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  visibility: 'public' | 'private';
  status?: 'draft' | 'pending_review';
  categoryId: number | null;
  tagIds: number[];
}

interface PostFormProps {
  mode: 'create' | 'edit';
  initial?: Post | null;
  isSubmitting?: boolean;
  error?: string | null;
  onCancel?: () => void;
  onSubmit: (payload: PostPayload) => void;
}

export function PostForm({ mode, initial, isSubmitting = false, error, onCancel, onSubmit }: PostFormProps) {
  const { user } = useAuth();
  const { has } = usePermissions();
  const categories = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => fetchCategoryList({ limit: '100' }),
    enabled: has('category.view'),
  });
  const tags = useQuery({
    queryKey: ['admin-tags'],
    queryFn: () => fetchTags({ limit: '100' }),
    enabled: has('tag.view'),
  });

  const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null);
  const [tagIds, setTagIds] = useState<number[]>(initial?.tags?.map((t) => t.id) ?? []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<PostFormValues>({
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      excerpt: initial?.excerpt ?? '',
      content: initial?.content ?? '',
      featuredImage: initial?.featuredImage ?? '',
      visibility: initial?.visibility ?? 'public',
      status: 'draft',
    },
  });

  useEffect(() => {
    const title = watch('title');
    if (mode === 'create' && title) {
      setValue('slug', slugify(title));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('title')]);

  const toggleTag = (id: number) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const onValid = (values: PostFormValues) => {
    const payload: PostPayload = {
      title: values.title,
      visibility: values.visibility,
      tagIds,
      categoryId: categoryId ?? null,
      content: values.content || undefined,
      excerpt: values.excerpt || undefined,
      featuredImage: values.featuredImage || null,
    };
    if (values.slug?.trim()) {
      payload.slug = slugify(values.slug);
    }
    if (mode === 'create') {
      payload.status = values.status ?? 'draft';
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      {error && <Alert type="error">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div>
            <Input label="Title" placeholder="Enter a title" {...register('title', { required: 'Title is required' })} />
          </div>

          <div>
            <Input
              label="Slug"
              placeholder="auto-generated from title"
              {...register('slug')}
              onBlur={(e) => {
                if (e.target.value) {
                  setValue('slug', slugify(e.target.value));
                }
              }}
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to auto-generate from the title.
            </p>
          </div>

          <div>
            <Textarea
              label="Excerpt"
              rows={3}
              placeholder="Short summary shown in post cards"
              {...register('excerpt')}
            />
          </div>

          <div>
            <Textarea label="Content" rows={12} placeholder="Write your post… (HTML supported)" {...register('content')} />
            <p className="mt-1 text-xs text-gray-500">Basic HTML is allowed and rendered on the public page.</p>
          </div>

          <div>
            <Input label="Featured image URL" placeholder="https://…/image.jpg" {...register('featuredImage')} />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Select
              label="Category"
              placeholder="No category"
              value={categoryId ? String(categoryId) : ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              options={(categories.data?.data ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
            />
            {categories.isLoading && <Spinner size="sm" />}
          </div>

          <div>
            <p className="mb-1 block text-sm font-medium text-gray-700">Tags</p>
            {tags.isLoading ? (
              <Spinner size="sm" />
            ) : (
              <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-md border border-gray-200 p-3">
                {(tags.data?.data ?? []).length === 0 && (
                  <p className="text-xs text-gray-400">No tags available.</p>
                )}
                {tags.data?.data.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={tagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <Select
              label="Visibility"
              options={[
                { value: 'public', label: 'Public' },
                { value: 'private', label: 'Private' },
              ]}
              {...register('visibility')}
            />
          </div>

          {mode === 'create' && (
            <div>
              <Select
                label="Status"
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'pending_review', label: 'Pending review' },
                ]}
                {...register('status')}
              />
            </div>
          )}

          <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-500">
            Author: <span className="font-medium text-gray-700">{user?.name}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
        {onCancel && (
          <Link href="/dashboard/posts">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </Link>
        )}
        <Button type="submit" loading={isSubmitting}>
          {mode === 'create' ? 'Create post' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}