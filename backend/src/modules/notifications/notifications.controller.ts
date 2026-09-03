import { Request, Response, NextFunction } from 'express';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from './notifications.service';
import { list, success, noContent } from '@utils/response';

export async function listNotificationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listNotifications(req.user!.id, req.query as never);
    return list(res, result.notifications, {
      ...result.meta,
      unreadCount: result.unreadCount,
    }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
}

export async function markReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await markNotificationRead(parseInt(req.params.id, 10), req.user!.id);
    return success(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await markAllNotificationsRead(req.user!.id);
    return success(res, result, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

export async function deleteNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteNotification(parseInt(req.params.id, 10), req.user!.id);
    return noContent(res);
  } catch (error) {
    next(error);
  }
}