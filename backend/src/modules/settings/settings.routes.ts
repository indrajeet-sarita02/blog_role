import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import { listSettingsHandler, updateSettingsHandler } from './settings.controller';
import { listSettingsSchema, updateSettingsSchema } from './settings.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('settings.view'), validate(listSettingsSchema), listSettingsHandler);
router.put('/', requirePermission('settings.update'), validate(updateSettingsSchema), updateSettingsHandler);

export default router;