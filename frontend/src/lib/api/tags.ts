import { getStore, saveStore, delay, makeSlug, nextId } from '@/lib/mock/store';
import { ApiListResponse, ApiResponse, Tag } from '@/types';

export async function fetchTags(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let tags = [...store.tags];

  if (params?.search) {
    const s = params.search.toLowerCase();
    tags = tags.filter((t) => t.name.toLowerCase().includes(s));
  }

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = tags.length;
  const start = (page - 1) * limit;
  const paged = tags.slice(start, start + limit);

  return {
    success: true,
    message: 'Tags fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Tag>;
}

export async function fetchTag(id: number) {
  await delay();
  const store = getStore();
  const tag = store.tags.find((t) => t.id === id);
  if (!tag) throw new Error('Tag not found');
  return tag;
}

export async function createTag(payload: { name: string }) {
  await delay();
  const store = getStore();
  const slug = makeSlug(payload.name);
  if (store.tags.find((t) => t.slug === slug)) {
    throw new Error('Tag already exists');
  }

  const tag: Tag = {
    id: nextId(store, 'tag'),
    name: payload.name,
    slug,
  };

  store.tags.push(tag);
  saveStore(store);
  return tag;
}

export async function updateTag(id: number, name: string) {
  await delay();
  const store = getStore();
  const tag = store.tags.find((t) => t.id === id);
  if (!tag) throw new Error('Tag not found');
  tag.name = name;
  tag.slug = makeSlug(name);
  saveStore(store);
  return tag;
}

export async function deleteTag(id: number) {
  await delay();
  const store = getStore();
  store.tags = store.tags.filter((t) => t.id !== id);
  saveStore(store);
}
