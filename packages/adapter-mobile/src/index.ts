import { Router } from 'express';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { userRouter } from './controllers/UserController.js';
import { projectRouter } from './controllers/ProjectController.js';

// Export middleware
export { authMiddleware } from './middleware/auth.js';
export { errorHandler } from './middleware/errorHandler.js';

// Export extensions
export * from './extensions/pagination.js';
export * from './extensions/offline.js';

/**
 * Create mobile adapter router
 */
export function createMobileRouter(): Router {
  const router = Router();

  // Apply auth middleware
  router.use(authMiddleware);

  // Mount domain routers
  router.use('/users', userRouter);
  router.use('/projects', projectRouter);

  // Error handler
  router.use(errorHandler);

  return router;
}
