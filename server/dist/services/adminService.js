"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const auditLogRepository_1 = require("../repositories/auditLogRepository");
const userRepository_1 = require("../repositories/userRepository");
const errors_1 = require("../utils/errors");
class AdminService {
    async listUsers(page, limit) {
        return (0, userRepository_1.listUsers)(page, limit);
    }
    async setUserRole(userId, role) {
        const updated = await (0, userRepository_1.updateUserRole)(userId, role);
        if (!updated)
            throw new errors_1.NotFoundError('User');
        return updated;
    }
    async setUserStatus(userId, isActive) {
        const updated = await (0, userRepository_1.updateUserStatus)(userId, isActive);
        if (!updated)
            throw new errors_1.NotFoundError('User');
        return updated;
    }
    async listAuditLogs(page, limit) {
        return (0, auditLogRepository_1.listAuditLogs)(page, limit);
    }
}
exports.adminService = new AdminService();
//# sourceMappingURL=adminService.js.map