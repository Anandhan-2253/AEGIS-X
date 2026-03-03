import { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { auditService } from '../services/auditService';
import { AuditAction } from '../types';

export const adminController = {
  async listUsers(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const data = await adminService.listUsers(page, limit);

    res.status(200).json({
      success: true,
      data: data.users,
      meta: { page, limit, total: data.total },
      requestId: req.requestId,
    });
  },

  async updateUserRole(req: Request, res: Response): Promise<void> {
    const updated = await adminService.setUserRole(req.params.userId, req.body.role);

    await auditService.logEvent({
      userId: req.user!.userId,
      action: AuditAction.USER_MANAGEMENT,
      resourceType: 'user_role',
      resourceId: req.params.userId,
      details: { role: req.body.role },
      ipAddress: req.ip ?? '0.0.0.0',
      userAgent: req.headers['user-agent'] ?? 'unknown',
    });

    res.status(200).json({ success: true, data: updated, requestId: req.requestId });
  },

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    const updated = await adminService.setUserStatus(req.params.userId, req.body.isActive);

    await auditService.logEvent({
      userId: req.user!.userId,
      action: AuditAction.USER_MANAGEMENT,
      resourceType: 'user_status',
      resourceId: req.params.userId,
      details: { isActive: req.body.isActive },
      ipAddress: req.ip ?? '0.0.0.0',
      userAgent: req.headers['user-agent'] ?? 'unknown',
    });

    res.status(200).json({ success: true, data: updated, requestId: req.requestId });
  },

  async listAuditLogs(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const data = await adminService.listAuditLogs(page, limit);

    res.status(200).json({
      success: true,
      data: data.rows,
      meta: { page, limit, total: data.total },
      requestId: req.requestId,
    });
  },
};
