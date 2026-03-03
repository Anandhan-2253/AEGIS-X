"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const adminService_1 = require("../services/adminService");
const auditService_1 = require("../services/auditService");
const types_1 = require("../types");
exports.adminController = {
    async listUsers(req, res) {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);
        const data = await adminService_1.adminService.listUsers(page, limit);
        res.status(200).json({
            success: true,
            data: data.users,
            meta: { page, limit, total: data.total },
            requestId: req.requestId,
        });
    },
    async updateUserRole(req, res) {
        const updated = await adminService_1.adminService.setUserRole(req.params.userId, req.body.role);
        await auditService_1.auditService.logEvent({
            userId: req.user.userId,
            action: types_1.AuditAction.USER_MANAGEMENT,
            resourceType: 'user_role',
            resourceId: req.params.userId,
            details: { role: req.body.role },
            ipAddress: req.ip ?? '0.0.0.0',
            userAgent: req.headers['user-agent'] ?? 'unknown',
        });
        res.status(200).json({ success: true, data: updated, requestId: req.requestId });
    },
    async updateUserStatus(req, res) {
        const updated = await adminService_1.adminService.setUserStatus(req.params.userId, req.body.isActive);
        await auditService_1.auditService.logEvent({
            userId: req.user.userId,
            action: types_1.AuditAction.USER_MANAGEMENT,
            resourceType: 'user_status',
            resourceId: req.params.userId,
            details: { isActive: req.body.isActive },
            ipAddress: req.ip ?? '0.0.0.0',
            userAgent: req.headers['user-agent'] ?? 'unknown',
        });
        res.status(200).json({ success: true, data: updated, requestId: req.requestId });
    },
    async listAuditLogs(req, res) {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);
        const data = await adminService_1.adminService.listAuditLogs(page, limit);
        res.status(200).json({
            success: true,
            data: data.rows,
            meta: { page, limit, total: data.total },
            requestId: req.requestId,
        });
    },
};
//# sourceMappingURL=adminController.js.map