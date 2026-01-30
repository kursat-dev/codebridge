import { Request, Response, NextFunction } from 'express';
import { DomainError } from '@corebridge/core';

/**
 * Central error handler
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof DomainError) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Unknown error
  console.error('Unhandled error:', error);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
