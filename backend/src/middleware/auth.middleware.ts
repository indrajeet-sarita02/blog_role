import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@utils/jwt';
import { AppError } from '@utils/AppError';

export interface AuthUser {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = header.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      throw AppError.unauthorized('Invalid token type');
    }

    req.user = { id: payload.sub };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(AppError.unauthorized('Invalid or expired token'));
    }
  }
}
