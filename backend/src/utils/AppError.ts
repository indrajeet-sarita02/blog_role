import { ERROR_CODE } from '@config/constants';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details: unknown;

  constructor(
    statusCode: number,
    message: string,
    code: string = ERROR_CODE.INTERNAL_SERVER_ERROR,
    details: unknown = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details: unknown = null) {
    return new AppError(400, message, ERROR_CODE.VALIDATION_ERROR, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(401, message, ERROR_CODE.UNAUTHORIZED);
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(403, message, ERROR_CODE.FORBIDDEN);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, message, ERROR_CODE.NOT_FOUND);
  }

  static conflict(message = 'Conflict') {
    return new AppError(409, message, ERROR_CODE.CONFLICT);
  }
}
