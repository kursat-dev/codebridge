import { Request, Response, NextFunction } from 'express';

/**
 * Web authentication middleware (session-based)
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Web uses session-based auth
  const sessionId = req.cookies?.session;

  if (!sessionId) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    return;
  }

  // Validate session and attach user to request
  // req.user = await validateSession(sessionId);

  next();
}
