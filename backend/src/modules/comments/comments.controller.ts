import { Request, Response, NextFunction } from 'express';
import {
  createComment,
  listCommentsByPost,
  listAllComments,
  getCommentOrThrow,
  updateComment,
  deleteComment,
  moderateComment,
} from './comments.service';
import { list, success, created, noContent } from '@utils/response';
import { COMMENT_STATUS } from '@config/constants';

export async function createCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await createComment(parseInt(req.params.postId, 10), req.user!.id, req.body);
    return created(res, comment, 'Comment created successfully');
  } catch (error) {
    next(error);
  }
}

export async function listCommentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listCommentsByPost(parseInt(req.params.postId, 10), req.user!.id, req.query as never);
    return list(res, result.comments, result.meta, 'Comments retrieved');
  } catch (error) {
    next(error);
  }
}

export async function listAllCommentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listAllComments(req.user!.id, req.query as never);
    return list(res, result.comments, result.meta, 'Comments retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await getCommentOrThrow(parseInt(req.params.id, 10));
    return success(res, comment, 'Comment retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await updateComment(parseInt(req.params.id, 10), req.user!.id, req.body.content);
    return success(res, comment, 'Comment updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteComment(parseInt(req.params.id, 10), req.user!.id);
    return noContent(res);
  } catch (error) {
    next(error);
  }
}

export async function approveCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await moderateComment(
      parseInt(req.params.id, 10),
      req.user!.id,
      COMMENT_STATUS.APPROVED,
      'comment.approve',
    );
    return success(res, comment, 'Comment approved');
  } catch (error) {
    next(error);
  }
}

export async function rejectCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await moderateComment(
      parseInt(req.params.id, 10),
      req.user!.id,
      COMMENT_STATUS.REJECTED,
      'comment.reject',
    );
    return success(res, comment, 'Comment rejected');
  } catch (error) {
    next(error);
  }
}
