import { Notification } from '@database/index';
import { AppError } from '@utils/AppError';
import { parsePagination } from '@utils/pagination';
import { Op, WhereOptions } from 'sequelize';

export async function listNotifications(actorId: string, filters: {
  page?: string;
  limit?: string;
  unread?: string;
  type?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const where: WhereOptions<Notification> = { userId: Number(actorId) };
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.unread === 'true') {
    where.readAt = { [Op.is]: null } as never;
  } else if (filters.unread === 'false') {
    where.readAt = { [Op.ne]: null } as never;
  }

  const { rows, count } = await Notification.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    distinct: true,
  });

  const unreadCount = await Notification.count({ where: { userId: Number(actorId), readAt: { [Op.is]: null } } });

  return {
    notifications: rows,
    unreadCount,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function markNotificationRead(id: number, actorId: string) {
  const notification = await Notification.findOne({ where: { id, userId: Number(actorId) } });
  if (!notification) {
    throw AppError.notFound('Notification not found');
  }
  notification.readAt = notification.readAt ?? new Date();
  await notification.save();
  return notification;
}

export async function markAllNotificationsRead(actorId: string) {
  await Notification.update(
    { readAt: new Date() },
    { where: { userId: Number(actorId), readAt: { [Op.is]: null } } },
  );
  return { updated: true };
}

export async function deleteNotification(id: number, actorId: string) {
  const notification = await Notification.findOne({ where: { id, userId: Number(actorId) } });
  if (!notification) {
    throw AppError.notFound('Notification not found');
  }
  await notification.destroy();
}