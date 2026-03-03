import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { paginationSchema, updateUserRoleSchema, updateUserStatusSchema } from '../models/schemas';
import { UserRole } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export function buildAdminRoutes(): Router {
  const router = Router();

  router.use(authenticate);
  router.use(authorize([UserRole.ADMIN]));

  router.get('/users', validate(paginationSchema, 'query'), asyncHandler(adminController.listUsers));
  router.patch('/users/:userId/role', validate(updateUserRoleSchema), asyncHandler(adminController.updateUserRole));
  router.patch('/users/:userId/status', validate(updateUserStatusSchema), asyncHandler(adminController.updateUserStatus));
  router.get('/audit-logs', validate(paginationSchema, 'query'), asyncHandler(adminController.listAuditLogs));

  return router;
}
