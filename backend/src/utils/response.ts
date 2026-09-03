import { Response } from 'express';

export function success<T>(res: Response, data: T, message = 'Success', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function created<T>(res: Response, data: T, message = 'Created successfully') {
  return res.status(201).json({ success: true, message, data });
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function list<T>(res: Response, data: T[], meta: object, message = 'Success') {
  return res.status(200).json({ success: true, message, data, meta });
}
