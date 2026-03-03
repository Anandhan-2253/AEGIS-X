import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { loginSchema, refreshTokenSchema, registerSchema } from '../models/schemas';
import { asyncHandler } from '../utils/asyncHandler';

export function buildAuthRoutes(): Router {
  const router = Router();

  router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
  router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
  router.post('/refresh', authLimiter, validate(refreshTokenSchema), asyncHandler(authController.refresh));

  return router;
}
