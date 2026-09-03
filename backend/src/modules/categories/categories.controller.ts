import { Request, Response, NextFunction } from 'express';
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories.service';
import { list, success, created, noContent } from '@utils/response';

export async function listCategoriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listCategories(req.query as never);
    return list(res, result.categories, result.meta, 'Categories retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await getCategoryById(parseInt(req.params.id, 10));
    return success(res, category, 'Category retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await createCategory(req.body);
    return created(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await updateCategory(parseInt(req.params.id, 10), req.body);
    return success(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteCategory(parseInt(req.params.id, 10));
    return noContent(res);
  } catch (error) {
    next(error);
  }
}
