import { getStore, saveStore, delay, nextId } from '@/lib/mock/store';
import { ApiListResponse, ApiResponse, Notification } from '@/types';

export async function fetchNotifications(params?: Record<string, string>) {
  await delay(20);
  const store = getStore();
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem('blog_access_token') : null;
  let userId: number | null = null;
  if (raw) {
    try {
      userId = JSON.parse(atob(raw)).userId;
    } catch {}
  }

  let notifications = store.notifications;
  if (userId !== null) {
    notifications = notifications.filter((n) => n.userId === userId);
  }

  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = notifications.length;
  const start = (page - 1) * limit;
  const paged = notifications.slice(start, start + limit);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return {
    success: true,
    message: 'Notifications fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit), unreadCount },
  } as ApiListResponse<Notification>;
}

export async function markNotificationRead(id: number) {
  await delay();
  const store = getStore();
  const notif = store.notifications.find((n) => n.id === id);
  if (notif) {
    notif.readAt = new Date().toISOString();
    saveStore(store);
  }
}

export async function markAllNotificationsRead() {
  await delay();
  const store = getStore();
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem('blog_access_token') : null;
  if (!raw) return;
  try {
    const { userId } = JSON.parse(atob(raw));
    const now = new Date().toISOString();
    store.notifications
      .filter((n) => n.userId === userId && !n.readAt)
      .forEach((n) => {
        n.readAt = now;
      });
    saveStore(store);
  } catch {}
}

export async function deleteNotification(id: number) {
  await delay();
  const store = getStore();
  store.notifications = store.notifications.filter((n) => n.id !== id);
  saveStore(store);
}
