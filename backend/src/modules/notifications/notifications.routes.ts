import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import {
  listNotificationsHandler,
  markReadHandler,
  markAllReadHandler,
  deleteNotificationHandler,
} from './notifications.controller';
import { listNotificationsSchema, notificationIdSchema } from './notifications.validation';

const router = Router();

router.use(authenticate);

router.get('/', validate(listNotificationsSchema), listNotificationsHandler);
router.patch('/read-all', markAllReadHandler);
router.patch('/:id/read', validate(notificationIdSchema), markReadHandler);
router.delete('/:id', validate(notificationIdSchema), deleteNotificationHandler);

export default router;