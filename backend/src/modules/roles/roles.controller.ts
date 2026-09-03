import { Request, Response, NextFunction } from 'express';
import {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions,
} from './roles.service';
import { list, success, created, noContent } from '@utils/response';

export async function listRolesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listRoles(req.query as never);
    return list(res, result.roles, result.meta, 'Roles retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getRoleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await getRoleById(parseInt(req.params.id, 10));
    return success(res, role, 'Role retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createRoleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await createRole(req.body, req.user!.id);
    return created(res, role, 'Role created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateRoleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await updateRole(parseInt(req.params.id, 10), req.body, req.user!.id);
    return success(res, role, 'Role updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteRoleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteRole(parseInt(req.params.id, 10), req.user!.id);
    return noContent(res);
  } catch (error) {
    next(error);
  }
}

export async function getRolePermissionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const permissions = await getRolePermissions(parseInt(req.params.id, 10));
    return success(res, permissions, 'Role permissions retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateRolePermissionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const permissions = await updateRolePermissions(parseInt(req.params.id, 10), req.body.permissionIds, req.user!.id);
    return success(res, permissions, 'Role permissions updated');
  } catch (error) {
    next(error);
  }
}
