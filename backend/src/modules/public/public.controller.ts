import { Request, Response, NextFunction } from 'express';
import {
  listPublicPosts,
  getPublicPostBySlug,
  listPublicCategories,
  getPublicCategoryBySlug,
  listPublicTags,
  getPublicTagBySlug,
  searchPublic,
} from './public.service';
import { list, success } from '@utils/response';

export async function listPostsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listPublicPosts(req.query as never);
    return list(res, result.posts, result.meta, 'Posts retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await getPublicPostBySlug(req.params.slug);
    return success(res, post, 'Post retrieved');
  } catch (error) {
    next(error);
  }
}

export async function listCategoriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listPublicCategories(req.query as never);
    return list(res, result.categories, result.meta, 'Categories retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await getPublicCategoryBySlug(req.params.slug);
    return success(res, category, 'Category retrieved');
  } catch (error) {
    next(error);
  }
}

export async function listTagsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listPublicTags(req.query as never);
    return list(res, result.tags, result.meta, 'Tags retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getTagHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await getPublicTagBySlug(req.params.slug);
    return success(res, tag, 'Tag retrieved');
  } catch (error) {
    next(error);
  }
}

export async function searchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await searchPublic(String(req.query.q), req.query as never);
    return list(res, result.posts, result.meta, 'Search results');
  } catch (error) {
    next(error);
  }
}
