import { Response } from 'express';

/**
 * Transform core output to HTTP response
 */
export function sendResponse<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(data);
}

/**
 * Send created response
 */
export function sendCreated<T>(res: Response, data: T): void {
  res.status(201).json(data);
}
