import { Response } from 'express';
import { wrapWithOfflineFlags, noCache } from '../extensions/offline.js';

/**
 * Send successful JSON response with offline flags
 */
export function sendResponse<T>(
  res: Response,
  data: T,
  operation: string,
  statusCode = 200
): void {
  res.status(statusCode).json(wrapWithOfflineFlags(data, operation));
}

/**
 * Send created response with tokens
 */
export function sendCreatedWithTokens<T>(
  res: Response,
  data: T,
  tokens: { access: string; refresh: string }
): void {
  res.status(201).json(
    noCache({
      ...data,
      tokens,
    })
  );
}

/**
 * Send created response
 */
export function sendCreated<T>(res: Response, data: T, operation: string): void {
  res.status(201).json(wrapWithOfflineFlags(data, operation));
}

/**
 * Send no content response (204)
 */
export function sendNoContent(res: Response): void {
  res.status(204).end();
}

/**
 * Send response without caching
 */
export function sendNoCacheResponse<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(noCache(data));
}
