import { getStore, saveStore, delay } from '@/lib/mock/store';

export type Settings = Record<string, string>;

export async function fetchSettings(_params?: Record<string, string>) {
  await delay();
  const store = getStore();
  return { ...store.settings } as Settings;
}

export async function updateSettings(updates: Record<string, string>) {
  await delay();
  const store = getStore();
  Object.assign(store.settings, updates);
  saveStore(store);
  return { ...store.settings } as Settings;
}