import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import {
  listTagsHandler,
  getTagHandler,
  createTagHandler,
  updateTagHandler,
  deleteTagHandler,
} from './tags.controller';
import { createTagSchema, updateTagSchema, tagIdSchema, listTagsSchema } from './tags.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('tag.view'), validate(listTagsSchema), listTagsHandler);
router.post('/', requirePermission('tag.create'), validate(createTagSchema), createTagHandler);
router.get('/:id', requirePermission('tag.view'), validate(tagIdSchema), getTagHandler);
router.put('/:id', requirePermission('tag.update'), validate(updateTagSchema), updateTagHandler);
router.delete('/:id', requirePermission('tag.delete'), validate(tagIdSchema), deleteTagHandler);

export default router;
