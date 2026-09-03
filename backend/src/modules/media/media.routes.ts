import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import { upload } from './media.upload';
import {
  listMediaHandler,
  getMediaHandler,
  uploadMediaHandler,
  updateMediaHandler,
  deleteMediaHandler,
} from './media.controller';
import { listMediaSchema, mediaIdSchema, updateMediaSchema } from './media.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('media.view'), validate(listMediaSchema), listMediaHandler);
router.post('/', requirePermission('media.upload'), upload.single('file'), uploadMediaHandler);
router.get('/:id', requirePermission('media.view'), validate(mediaIdSchema), getMediaHandler);
router.put('/:id', requirePermission('media.upload'), validate(updateMediaSchema), updateMediaHandler);
router.delete('/:id', requirePermission('media.delete'), validate(mediaIdSchema), deleteMediaHandler);

export default router;
