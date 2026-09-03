import { Request, Response, NextFunction } from 'express';
import { listPermissions, getPermissionById } from './permissions.service';
import { list, success } from '@utils/response';

export async function listPermissionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listPermissions(req.query as never);
    return list(res, result.permissions, result.meta, 'Permissions retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getPermissionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const permission = await getPermissionById(parseInt(req.params.id, 10));
    return success(res, permission, 'Permission retrieved');
  } catch (error) {
    next(error);
  }
}
