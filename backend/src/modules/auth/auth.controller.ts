import { Request, Response, NextFunction } from 'express';
import { register, login, refresh, getMe } from './auth.service';
import { success, created } from '@utils/response';

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await register(req.body);
    return created(res, result, 'Registered successfully');
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await login(req.body);
    return success(res, result, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await refresh(req.body);
    return success(res, result, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getMe(req.user!.id);
    return success(res, user, 'Current user retrieved');
  } catch (error) {
    next(error);
  }
}
