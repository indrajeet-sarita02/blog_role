'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/api/notifications';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils/format';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  const notifications = useQuery({
    queryKey: ['notifications', { page, filter }],
    queryFn: () =>
      fetchNotifications({
        page: String(page),
        limit: '20',
        ...(filter ? { unread: filter } : {}),
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const readM = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => invalidate(),
  });

  const readAllM = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => invalidate(),
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => invalidate(),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {notifications.data?.meta.unreadCount
              ? `${notifications.data.meta.unreadCount} unread`
              : 'You are all caught up'}
          </p>
        </div>
        {notifications.data?.meta.unreadCount ? (
          <Button variant="outline" onClick={() => readAllM.mutate()} loading={readAllM.isLoading}>
            Mark all as read
          </Button>
        ) : null}
      </div>

      <div className="mb-4">
        <Select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="w-44"
          options={[
            { value: '', label: 'All notifications' },
            { value: 'true', label: 'Unread only' },
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardBody className="px-0">
          {notifications.isLoading ? (
            <PageLoader />
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.data?.data.length === 0 && (
                <li className="px-5 py-10 text-center text-sm text-gray-500">No notifications.</li>
              )}
              {notifications.data?.data.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                      <p className={`text-sm font-medium ${n.readAt ? 'text-gray-500' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                      <Badge status={n.type} />
                    </div>
                    {n.message && <p className="mt-1 text-sm text-gray-600">{n.message}</p>}
                    <p className="mt-1 text-xs text-gray-400">{formatDate(n.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {!n.readAt && (
                      <Button size="sm" variant="ghost" onClick={() => readM.mutate(n.id)}>
                        Mark read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteM.mutate(n.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {notifications.data?.meta && (
            <div className="px-5 pb-4">
              <Pagination meta={notifications.data.meta} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}