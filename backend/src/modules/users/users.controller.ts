import { Request, Response, NextFunction } from 'express';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRoles,
  deleteUser,
} from './users.service';
import { list, success, created, noContent } from '@utils/response';

export async function listUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listUsers(req.query as never);
    return list(res, result.users, result.meta, 'Users retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserById(parseInt(req.params.id, 10));
    return success(res, user, 'User retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await createUser(req.body, req.user!.id);
    return created(res, user, 'User created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await updateUser(parseInt(req.params.id, 10), req.body);
    return success(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await updateUserStatus(parseInt(req.params.id, 10), req.body.status, req.user!.id);
    return success(res, user, 'User status updated');
  } catch (error) {
    next(error);
  }
}

export async function updateUserRolesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await updateUserRoles(parseInt(req.params.id, 10), req.body.roleIds, req.user!.id);
    return success(res, user, 'User roles updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteUser(parseInt(req.params.id, 10), req.user!.id);
    return noContent(res);
  } catch (error) {
    next(error);
  }
}
