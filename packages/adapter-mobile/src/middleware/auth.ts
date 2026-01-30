import { Request, Response, NextFunction } from 'express';

/**
 * Mobile authentication middleware (token-based)
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Mobile uses Bearer token auth
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);

  // Validate token and attach user to request
  // req.user = await validateToken(token);

  // Log device info for analytics
  const deviceId = req.headers['x-device-id'];
  const appVersion = req.headers['x-app-version'];

  next();
}
