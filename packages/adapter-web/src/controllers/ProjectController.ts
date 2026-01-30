import { Router, Request, Response, NextFunction } from 'express';
import { createProject, getProject } from '@corebridge/core';
import { transformRequest, getUserId } from '../transformers/request.js';
import { sendResponse, sendCreated } from '../transformers/response.js';

const router = Router();

/**
 * GET /projects
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const input = transformRequest(req);

    // Call core use case
    // const result = await listProjects(userId, input, deps);

    sendResponse(res, { message: 'List projects - implement me' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /projects
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const input = transformRequest(req);

    // Call core use case
    // const result = await createProject(input, userId, deps);

    sendCreated(res, { message: 'Create project - implement me' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /projects/:id
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // Call core use case
    // const result = await getProject(id, userId, deps);

    sendResponse(res, { message: 'Get project - implement me' });
  } catch (error) {
    next(error);
  }
});

export const projectRouter = router;
