import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError';
import { resolveUserPermissions } from '@utils/permissions';

export function requirePermission(permissionSlug: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required');
      }

      const resolved = await resolveUserPermissions(req.user.id);
      if (!resolved.permissions.has(permissionSlug)) {
        throw AppError.forbidden();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
