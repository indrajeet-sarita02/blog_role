import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import {
  listUsersHandler,
  getUserHandler,
  createUserHandler,
  updateUserHandler,
  updateUserStatusHandler,
  updateUserRolesHandler,
  deleteUserHandler,
} from './users.controller';
import {
  listUsersSchema,
  getUserByIdSchemaOnly,
  updateUserSchema,
  updateUserStatusSchema,
  updateUserRolesSchema,
  createUserSchema,
  deleteUserSchema,
} from './users.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('user.view'), validate(listUsersSchema), listUsersHandler);
router.post('/', requirePermission('user.create'), validate(createUserSchema), createUserHandler);
router.get('/:id', requirePermission('user.view'), validate(getUserByIdSchemaOnly), getUserHandler);
router.put('/:id', requirePermission('user.update'), validate(updateUserSchema), updateUserHandler);
router.patch('/:id/status', requirePermission('user.update'), validate(updateUserStatusSchema), updateUserStatusHandler);
router.put('/:id/roles', requirePermission('user.update'), validate(updateUserRolesSchema), updateUserRolesHandler);
router.delete('/:id', requirePermission('user.delete'), validate(deleteUserSchema), deleteUserHandler);

export default router;
