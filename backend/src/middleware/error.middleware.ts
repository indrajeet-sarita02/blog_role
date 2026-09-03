import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError';
import { HTTP_STATUS } from '@config/constants';

interface ZodErrorLike {
  issues?: Array<{ path: (string | number)[]; message: string }>;
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(AppError.notFound(`Route ${req.originalUrl} not found`));
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let details: unknown = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else {
    const zodError = err as ZodErrorLike;
    if (zodError?.issues) {
      statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
      details = zodError.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
    }
  }

  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: { code, details },
  });
}
