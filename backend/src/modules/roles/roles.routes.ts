import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import {
  listRolesHandler,
  getRoleHandler,
  createRoleHandler,
  updateRoleHandler,
  deleteRoleHandler,
  getRolePermissionsHandler,
  updateRolePermissionsHandler,
} from './roles.controller';
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdSchema,
  listRolesSchema,
  updateRolePermissionsSchema,
} from './roles.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('role.view'), validate(listRolesSchema), listRolesHandler);
router.post('/', requirePermission('role.create'), validate(createRoleSchema), createRoleHandler);
router.get('/:id', requirePermission('role.view'), validate(roleIdSchema), getRoleHandler);
router.put('/:id', requirePermission('role.update'), validate(updateRoleSchema), updateRoleHandler);
router.delete('/:id', requirePermission('role.delete'), validate(roleIdSchema), deleteRoleHandler);
router.get('/:id/permissions', requirePermission('role.view'), validate(roleIdSchema), getRolePermissionsHandler);
router.put('/:id/permissions', requirePermission('role.assignPermission'), validate(updateRolePermissionsSchema), updateRolePermissionsHandler);

export default router;
