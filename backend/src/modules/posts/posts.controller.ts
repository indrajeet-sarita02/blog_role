import { Request, Response, NextFunction } from 'express';
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  changePostStatus,
  submitForReview,
  listRevisions,
  getRevision,
  restoreRevision,
} from './posts.service';
import { list, success, created, noContent } from '@utils/response';
import { POST_STATUS } from '@config/constants';

export async function listPostsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listPosts(req.query as never, req.user!.id);
    return list(res, result.posts, result.meta, 'Posts retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await getPost(parseInt(req.params.id, 10), req.user!.id);
    return success(res, post, 'Post retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await createPost(req.body, req.user!.id);
    return created(res, post, 'Post created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updatePostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await updatePost(parseInt(req.params.id, 10), req.body, req.user!.id);
    return success(res, post, 'Post updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deletePostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deletePost(parseInt(req.params.id, 10), req.user!.id);
    return noContent(res);
  } catch (error) {
    next(error);
  }
}

export async function submitForReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await submitForReview(parseInt(req.params.id, 10), req.user!.id);
    return success(res, post, 'Post submitted for review');
  } catch (error) {
    next(error);
  }
}

export async function approvePostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await changePostStatus(
      parseInt(req.params.id, 10),
      req.user!.id,
      POST_STATUS.APPROVED,
      'blog.approve',
    );
    return success(res, post, 'Post approved');
  } catch (error) {
    next(error);
  }
}

export async function rejectPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await changePostStatus(
      parseInt(req.params.id, 10),
      req.user!.id,
      POST_STATUS.REJECTED,
      'blog.reject',
    );
    return success(res, post, 'Post rejected');
  } catch (error) {
    next(error);
  }
}

export async function publishPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await changePostStatus(
      parseInt(req.params.id, 10),
      req.user!.id,
      POST_STATUS.PUBLISHED,
      'blog.publish',
    );
    return success(res, post, 'Post published');
  } catch (error) {
    next(error);
  }
}

export async function archivePostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await changePostStatus(
      parseInt(req.params.id, 10),
      req.user!.id,
      POST_STATUS.ARCHIVED,
      'blog.archive',
    );
    return success(res, post, 'Post archived');
  } catch (error) {
    next(error);
  }
}

export async function listRevisionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const revisions = await listRevisions(parseInt(req.params.id, 10), req.user!.id);
    return success(res, revisions, 'Revisions retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getRevisionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const revision = await getRevision(
      parseInt(req.params.id, 10),
      parseInt(req.params.revisionId, 10),
      req.user!.id,
    );
    return success(res, revision, 'Revision retrieved');
  } catch (error) {
    next(error);
  }
}

export async function restoreRevisionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await restoreRevision(
      parseInt(req.params.id, 10),
      parseInt(req.params.revisionId, 10),
      req.user!.id,
    );
    return success(res, post, 'Revision restored');
  } catch (error) {
    next(error);
  }
}
