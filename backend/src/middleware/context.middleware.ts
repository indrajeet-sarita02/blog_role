import { Request, Response, NextFunction } from 'express';
import { requestStorage } from '@utils/context';
import crypto from 'crypto';

export function requestContext(_req: Request, _res: Response, next: NextFunction) {
  const ipHeader = _req.headers['x-forwarded-for'];
  const ip = Array.isArray(ipHeader)
    ? ipHeader[0]
    : ipHeader || _req.socket?.remoteAddress || _req.ip;

  requestStorage.run(
    {
      requestId: crypto.randomUUID(),
      ip: String(ip ?? ''),
      userAgent: _req.headers['user-agent']?.slice(0, 500),
    },
    () => next(),
  );
}