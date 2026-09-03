import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import { listPermissionsHandler, getPermissionHandler } from './permissions.controller';
import { listPermissionsSchema, permissionIdSchema } from './permissions.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('permission.view'), validate(listPermissionsSchema), listPermissionsHandler);
router.get('/:id', requirePermission('permission.view'), validate(permissionIdSchema), getPermissionHandler);

export default router;
