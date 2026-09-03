'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import { fetchMedia, uploadMedia, updateMediaAlt, deleteMedia } from '@/lib/api/media';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { extractErrorMessage } from '@/lib/api/client';
import { formatDateTime, formatFileSize } from '@/lib/utils/format';
import { usePermissions } from '@/hooks/usePermissions';

export default function MediaPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const media = useQuery({
    queryKey: ['media', { page, search }],
    queryFn: () => fetchMedia({ page: String(page), limit: '24', ...(search ? { search } : {}) }),
    enabled: has('media.view'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['media'] });

  const uploadMutation = useMutation({
    mutationFn: (payload: { file: File; altText?: string }) => uploadMedia(payload.file, payload.altText),
    onSuccess: () => {
      setFile(null);
      setAltText('');
      setError(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const altMutation = useMutation({
    mutationFn: ({ id, alt }: { id: number; alt: string }) => updateMediaAlt(id, alt),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMedia(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const isImage = (mime: string) => mime.startsWith('image/');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media</h1>
        <p className="mt-1 text-sm text-gray-500">Upload and manage your media library.</p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {has('media.upload') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload file</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <Input
                  label="Alt text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
              <input
                id="media-file"
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt,.mp4,.webm"
                className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Button
                disabled={!file}
                loading={uploadMutation.isLoading}
                onClick={() => file && uploadMutation.mutate({ file, altText: altText || undefined })}
              >
                Upload
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by filename…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
        </CardHeader>
        <CardBody>
          {media.isLoading ? (
            <PageLoader />
          ) : media.data?.data.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">No media files yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {media.data?.data.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="flex h-36 items-center justify-center bg-gray-50">
                    {isImage(item.mimeType) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.altText ?? item.originalName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        {item.mimeType.split('/')[1] ?? 'file'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm font-medium text-gray-900" title={item.originalName}>
                      {item.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.fileSize)} · {formatDateTime(item.createdAt)}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const alt = window.prompt('Alt text', item.altText ?? '');
                          if (alt !== null) altMutation.mutate({ id: item.id, alt });
                        }}
                      >
                        Alt
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete "${item.originalName}"?`)) deleteMutation.mutate(item.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {media.data?.meta && (
            <div className="mt-4">
              <Pagination meta={media.data.meta} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}