import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import {
  listPostsHandler,
  getPostHandler,
  listCategoriesHandler,
  getCategoryHandler,
  listTagsHandler,
  getTagHandler,
  searchHandler,
} from './public.controller';
import { listPublicSchema, slugParamSchema, searchSchema } from './public.validation';

const router = Router();

router.get('/posts', validate(listPublicSchema), listPostsHandler);
router.get('/posts/:slug', validate(slugParamSchema), getPostHandler);
router.get('/categories', validate(listPublicSchema), listCategoriesHandler);
router.get('/categories/:slug', validate(slugParamSchema), getCategoryHandler);
router.get('/tags', validate(listPublicSchema), listTagsHandler);
router.get('/tags/:slug', validate(slugParamSchema), getTagHandler);
router.get('/search', validate(searchSchema), searchHandler);

export default router;
