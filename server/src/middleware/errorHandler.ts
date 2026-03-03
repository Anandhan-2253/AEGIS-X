import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: req.requestId,
  });
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  const appError = error instanceof AppError
    ? error
    : new AppError('Internal server error', StatusCodes.INTERNAL_SERVER_ERROR, false);

  logger.error('request_failed', {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    statusCode: appError.statusCode,
    message: appError.message,
    stack: error instanceof Error ? error.stack : undefined,
    details: appError.details,
  });

  res.status(appError.statusCode).json({
    success: false,
    error: appError.message,
    details: appError.details,
    requestId: req.requestId,
  });
}
