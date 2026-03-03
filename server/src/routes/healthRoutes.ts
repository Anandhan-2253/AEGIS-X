import { Router } from 'express';
import { healthController } from '../controllers/healthController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export function buildHealthRoutes(): Router {
  const router = Router();

  router.get('/', asyncHandler(healthController.health));
  router.get('/worker', authenticate, authorize([UserRole.ADMIN]), asyncHandler(healthController.workerStatus));

  return router;
}
