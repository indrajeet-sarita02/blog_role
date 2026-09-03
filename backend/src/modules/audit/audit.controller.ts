import { Request, Response, NextFunction } from 'express';
import { listAuditLogs, getAuditLog } from './audit.service';
import { list, success } from '@utils/response';

export async function listAuditHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listAuditLogs(req.query as never);
    return list(res, result.logs, result.meta, 'Audit logs retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getAuditHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await getAuditLog(parseInt(req.params.id, 10));
    return success(res, log, 'Audit log retrieved');
  } catch (error) {
    next(error);
  }
}