import { getStore, saveStore, delay, makeSlug, nextId } from '@/lib/mock/store';
import { ApiListResponse, ApiResponse, Category } from '@/types';

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: number | null;
  status?: string;
}

export async function fetchCategoryList(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let categories = [...store.categories];

  if (params?.search) {
    const s = params.search.toLowerCase();
    categories = categories.filter((c) => c.name.toLowerCase().includes(s));
  }

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = categories.length;
  const start = (page - 1) * limit;
  const paged = categories.slice(start, start + limit);

  return {
    success: true,
    message: 'Categories fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<Category>;
}

export async function fetchCategory(id: number) {
  await delay();
  const store = getStore();
  const cat = store.categories.find((c) => c.id === id);
  if (!cat) throw new Error('Category not found');
  return cat;
}

export async function createCategory(payload: CategoryPayload) {
  await delay();
  const store = getStore();
  const slug = payload.slug || makeSlug(payload.name);

  if (store.categories.find((c) => c.slug === slug)) {
    throw new Error('Category with this slug already exists');
  }

  const cat: Category = {
    id: nextId(store, 'category'),
    name: payload.name,
    slug,
    description: payload.description || null,
    status: payload.status || 'active',
    parentId: payload.parentId || null,
  };

  store.categories.push(cat);
  saveStore(store);
  return cat;
}

export async function updateCategory(id: number, payload: Partial<CategoryPayload>) {
  await delay();
  const store = getStore();
  const cat = store.categories.find((c) => c.id === id);
  if (!cat) throw new Error('Category not found');

  if (payload.name !== undefined) cat.name = payload.name;
  if (payload.slug !== undefined) cat.slug = payload.slug;
  if (payload.description !== undefined) cat.description = payload.description;
  if (payload.status !== undefined) cat.status = payload.status;
  if (payload.parentId !== undefined) cat.parentId = payload.parentId;

  saveStore(store);
  return cat;
}

export async function deleteCategory(id: number) {
  await delay();
  const store = getStore();
  store.categories = store.categories.filter((c) => c.id !== id);
  saveStore(store);
}
