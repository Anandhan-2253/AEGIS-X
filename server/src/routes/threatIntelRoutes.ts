import { Router } from 'express';
import { threatIntelController } from '../controllers/threatIntelController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createThreatIntelSchema,
  iocQuerySchema,
  paginationSchema,
} from '../models/schemas';
import { UserRole } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

export function buildThreatIntelRoutes(): Router {
  const router = Router();

  router.use(authenticate);

  router.post(
    '/query',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST, UserRole.MALWARE_ANALYST]),
    validate(iocQuerySchema),
    asyncHandler(threatIntelController.queryIOC),
  );

  router.post(
    '/',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST]),
    validate(createThreatIntelSchema),
    asyncHandler(threatIntelController.createIntel),
  );

  router.post(
    '/correlate',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST, UserRole.MALWARE_ANALYST]),
    validate(z.object({ evidence: z.string().min(1).max(20000) })),
    asyncHandler(threatIntelController.correlate),
  );

  router.get(
    '/',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST, UserRole.MALWARE_ANALYST, UserRole.VIEWER]),
    validate(paginationSchema, 'query'),
    asyncHandler(threatIntelController.listIntel),
  );

  return router;
}
