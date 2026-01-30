import { Request } from 'express';

/**
 * Transform HTTP request to core input
 */
export function transformRequest<T>(req: Request): T {
  return {
    ...req.body,
    ...req.query,
    ...req.params,
  } as T;
}

/**
 * Extract user ID from authenticated request
 */
export function getUserId(req: Request): string {
  // Assumes auth middleware has attached user
  return (req as any).user?.id ?? '';
}
