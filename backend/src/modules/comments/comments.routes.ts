import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import {
  getCommentHandler,
  listAllCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
  approveCommentHandler,
  rejectCommentHandler,
} from './comments.controller';
import {
  commentIdSchema,
  updateCommentSchema,
  listAllCommentsSchema,
} from './comments.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('comment.view'), validate(listAllCommentsSchema), listAllCommentsHandler);
router.get('/:id', requirePermission('comment.view'), validate(commentIdSchema), getCommentHandler);
router.put('/:id', requirePermission('comment.update'), validate(updateCommentSchema), updateCommentHandler);
router.delete('/:id', requirePermission('comment.delete'), validate(commentIdSchema), deleteCommentHandler);
router.post('/:id/approve', requirePermission('comment.approve'), validate(commentIdSchema), approveCommentHandler);
router.post('/:id/reject', requirePermission('comment.reject'), validate(commentIdSchema), rejectCommentHandler);

export default router;
