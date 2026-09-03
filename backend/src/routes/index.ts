import { Router } from 'express';
import { COMMON } from '@config/constants';
import authRoutes from '@modules/auth/auth.routes';
import usersRoutes from '@modules/users/users.routes';
import rolesRoutes from '@modules/roles/roles.routes';
import permissionsRoutes from '@modules/permissions/permissions.routes';
import categoriesRoutes from '@modules/categories/categories.routes';
import tagsRoutes from '@modules/tags/tags.routes';
import postsRoutes from '@modules/posts/posts.routes';
import commentsRoutes from '@modules/comments/comments.routes';
import postCommentsRoutes from '@modules/comments/postComments.routes';
import publicRoutes from '@modules/public/public.routes';
import mediaRoutes from '@modules/media/media.routes';
import auditRoutes from '@modules/audit/audit.routes';
import notificationsRoutes from '@modules/notifications/notifications.routes';
import settingsRoutes from '@modules/settings/settings.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'OK', data: { status: 'up' } });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/tags', tagsRoutes);
router.use('/posts', postsRoutes);
router.use('/posts/:postId/comments', postCommentsRoutes);
router.use('/comments', commentsRoutes);
router.use('/public', publicRoutes);
router.use('/media', mediaRoutes);
router.use('/audit', auditRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/settings', settingsRoutes);

export function setupRoutes(app: { use: (path: string, router: Router) => void }) {
  app.use(COMMON.apiBase, router);
}
