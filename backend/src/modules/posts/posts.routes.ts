import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import {
  listPostsHandler,
  getPostHandler,
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
  submitForReviewHandler,
  approvePostHandler,
  rejectPostHandler,
  publishPostHandler,
  archivePostHandler,
  listRevisionsHandler,
  getRevisionHandler,
  restoreRevisionHandler,
} from './posts.controller';
import {
  listPostsSchema,
  createPostSchema,
  updatePostSchema,
  idParamSchema,
  revisionParamSchema,
} from './posts.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('blog.view'), validate(listPostsSchema), listPostsHandler);
router.post('/', requirePermission('blog.create'), validate(createPostSchema), createPostHandler);
router.get('/:id', requirePermission('blog.view'), validate(idParamSchema), getPostHandler);
router.put('/:id', requirePermission('blog.update'), validate(updatePostSchema), updatePostHandler);
router.delete('/:id', requirePermission('blog.delete'), validate(idParamSchema), deletePostHandler);

router.post('/:id/submit-review', requirePermission('blog.update'), validate(idParamSchema), submitForReviewHandler);
router.post('/:id/approve', requirePermission('blog.approve'), validate(idParamSchema), approvePostHandler);
router.post('/:id/reject', requirePermission('blog.reject'), validate(idParamSchema), rejectPostHandler);
router.post('/:id/publish', requirePermission('blog.publish'), validate(idParamSchema), publishPostHandler);
router.post('/:id/archive', requirePermission('blog.archive'), validate(idParamSchema), archivePostHandler);

router.get('/:id/revisions', requirePermission('blog.view'), validate(idParamSchema), listRevisionsHandler);
router.get('/:id/revisions/:revisionId', requirePermission('blog.view'), validate(revisionParamSchema), getRevisionHandler);
router.post('/:id/revisions/:revisionId/restore', requirePermission('blog.update'), validate(revisionParamSchema), restoreRevisionHandler);

export default router;
