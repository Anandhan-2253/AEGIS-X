import { Router } from 'express';
import { socController } from '../controllers/socController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createIncidentSchema,
  ingestLogBatchSchema,
  ingestLogSchema,
  paginationSchema,
  updateIncidentSchema,
} from '../models/schemas';
import { UserRole } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export function buildSOCRoutes(): Router {
  const router = Router();

  router.use(authenticate);

  router.post(
    '/logs/ingest',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST]),
    validate(ingestLogSchema),
    asyncHandler(socController.ingestLog),
  );

  router.post(
    '/logs/ingest-batch',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST]),
    validate(ingestLogBatchSchema),
    asyncHandler(socController.ingestLogBatch),
  );

  router.get(
    '/logs',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST, UserRole.MALWARE_ANALYST, UserRole.VIEWER]),
    validate(paginationSchema, 'query'),
    asyncHandler(socController.listLogs),
  );

  router.get(
    '/alerts',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST, UserRole.MALWARE_ANALYST, UserRole.VIEWER]),
    validate(paginationSchema, 'query'),
    asyncHandler(socController.listAlerts),
  );

  router.post(
    '/incidents',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST]),
    validate(createIncidentSchema),
    asyncHandler(socController.createIncident),
  );

  router.get(
    '/incidents',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST, UserRole.MALWARE_ANALYST, UserRole.VIEWER]),
    validate(paginationSchema, 'query'),
    asyncHandler(socController.listIncidents),
  );

  router.patch(
    '/incidents/:id',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST]),
    validate(updateIncidentSchema),
    asyncHandler(socController.updateIncident),
  );

  router.get(
    '/incidents/:id/timeline',
    authorize([UserRole.ADMIN, UserRole.SOC_ANALYST, UserRole.MALWARE_ANALYST, UserRole.VIEWER]),
    asyncHandler(socController.incidentTimeline),
  );

  return router;
}
