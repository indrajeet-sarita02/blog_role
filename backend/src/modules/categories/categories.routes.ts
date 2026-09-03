import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import {
  listCategoriesHandler,
  getCategoryHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from './categories.controller';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  listCategoriesSchema,
} from './categories.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('category.view'), validate(listCategoriesSchema), listCategoriesHandler);
router.post('/', requirePermission('category.create'), validate(createCategorySchema), createCategoryHandler);
router.get('/:id', requirePermission('category.view'), validate(categoryIdSchema), getCategoryHandler);
router.put('/:id', requirePermission('category.update'), validate(updateCategorySchema), updateCategoryHandler);
router.delete('/:id', requirePermission('category.delete'), validate(categoryIdSchema), deleteCategoryHandler);

export default router;
