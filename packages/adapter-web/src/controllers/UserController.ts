import { Router, Request, Response, NextFunction } from 'express';
import { createUser, getUser } from '@corebridge/core';
import { transformRequest, getUserId } from '../transformers/request.js';
import { sendResponse, sendCreated } from '../transformers/response.js';

const router = Router();

/**
 * GET /users
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const input = transformRequest(req);

    // Call core use case
    // const result = await listUsers(userId, input, deps);

    sendResponse(res, { message: 'List users - implement me' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /users
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const input = transformRequest(req);

    // Call core use case
    // const result = await createUser(input, userId, deps);

    sendCreated(res, { message: 'Create user - implement me' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /users/:id
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // Call core use case
    // const result = await getUser(id, userId, deps);

    sendResponse(res, { message: 'Get user - implement me' });
  } catch (error) {
    next(error);
  }
});

export const userRouter = router;
