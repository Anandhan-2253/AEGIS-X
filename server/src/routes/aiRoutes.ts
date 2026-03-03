import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { aiAnalysisSchema } from '../models/schemas';
import { UserRole } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export function buildAIRoutes(): Router {
  const router = Router();

  router.use(authenticate);

  router.post(
    '/analyze',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST, UserRole.MALWARE_ANALYST, UserRole.PENTESTER]),
    validate(aiAnalysisSchema),
    asyncHandler(aiController.analyze),
  );

  return router;
}
