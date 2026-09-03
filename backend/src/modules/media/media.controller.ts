import { Request, Response, NextFunction } from 'express';
import { listMedia, getMediaById, saveUpload, updateMedia, deleteMedia } from './media.service';
import { list, success, created, noContent } from '@utils/response';

export async function listMediaHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listMedia(req.user!.id, req.query as never);
    return list(res, result.media, result.meta, 'Media retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getMediaHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await getMediaById(parseInt(req.params.id, 10));
    return success(res, media, 'Media retrieved');
  } catch (error) {
    next(error);
  }
}

export async function uploadMediaHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await saveUpload(req.user!.id, req.file!, req.body.altText);
    return created(res, media, 'Media uploaded successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateMediaHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await updateMedia(parseInt(req.params.id, 10), req.user!.id, req.body);
    return success(res, media, 'Media updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteMediaHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteMedia(parseInt(req.params.id, 10), req.user!.id);
    return noContent(res);
  } catch (error) {
    next(error);
  }
}
