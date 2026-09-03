import { Request, Response, NextFunction } from 'express';
import { listSettings, updateSettings } from './settings.service';
import { list, success } from '@utils/response';

export async function listSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listSettings(req.query as never);
    return list(res, result.settings, result.meta, 'Settings retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await updateSettings(req.user!.id, req.body);
    return success(res, settings, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
}