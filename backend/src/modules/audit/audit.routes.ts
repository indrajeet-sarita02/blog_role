import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import { listAuditHandler, getAuditHandler } from './audit.controller';
import { listAuditSchema, auditIdSchema } from './audit.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('audit.view'), validate(listAuditSchema), listAuditHandler);
router.get('/:id', requirePermission('audit.view'), validate(auditIdSchema), getAuditHandler);

export default router;