import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import { createCommentHandler, listCommentsHandler } from './comments.controller';
import { createCommentSchema, listCommentsSchema } from './comments.validation';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission('comment.create'), validate(createCommentSchema), createCommentHandler);
router.get('/', requirePermission('comment.view'), validate(listCommentsSchema), listCommentsHandler);

export default router;
