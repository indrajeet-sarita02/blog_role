import { getStore, saveStore, delay, nextId } from '@/lib/mock/store';
import { ApiListResponse, ApiResponse, Media } from '@/types';

export async function fetchMedia(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let media = [...store.media];

  if (params?.search) {
    const s = params.search.toLowerCase();
    media = media.filter(
      (m) =>
        m.originalName.toLowerCase().includes(s) ||
        m.altText?.toLowerCase().includes(s),
    );
  }

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = media.length;
  const start = (page - 1) * limit;
  const paged = media.slice(start, start + limit);

  return {
    success: true,
    message: 'Media fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Media>;
}

export async function uploadMedia(file: File, altText?: string) {
  await delay(100);
  const store = getStore();
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem('blog_access_token') : null;
  if (!raw) throw new Error('Not authenticated');
  const tokenPayload = JSON.parse(atob(raw));

  const fileName = `${Date.now()}-${file.name}`;
  const mediaItem: Media = {
    id: nextId(store, 'media'),
    userId: tokenPayload.userId,
    fileName,
    originalName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    url: `/uploads/${fileName}`,
    altText: altText || null,
    createdAt: new Date().toISOString(),
  };

  store.media.push(mediaItem);
  saveStore(store);
  return mediaItem;
}

export async function updateMediaAlt(id: number, altText: string) {
  await delay();
  const store = getStore();
  const item = store.media.find((m) => m.id === id);
  if (!item) throw new Error('Media not found');
  item.altText = altText;
  saveStore(store);
  return item;
}

export async function deleteMedia(id: number) {
  await delay();
  const store = getStore();
  store.media = store.media.filter((m) => m.id !== id);
  saveStore(store);
}
