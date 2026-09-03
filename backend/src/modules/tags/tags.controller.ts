import { Request, Response, NextFunction } from 'express';
import { listTags, getTagById, createTag, updateTag, deleteTag } from './tags.service';
import { list, success, created, noContent } from '@utils/response';

export async function listTagsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listTags(req.query as never);
    return list(res, result.tags, result.meta, 'Tags retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getTagHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await getTagById(parseInt(req.params.id, 10));
    return success(res, tag, 'Tag retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createTagHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await createTag(req.body);
    return created(res, tag, 'Tag created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateTagHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await updateTag(parseInt(req.params.id, 10), req.body);
    return success(res, tag, 'Tag updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteTagHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteTag(parseInt(req.params.id, 10));
    return noContent(res);
  } catch (error) {
    next(error);
  }
}
