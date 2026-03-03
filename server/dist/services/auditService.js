"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const auditLogRepository_1 = require("../repositories/auditLogRepository");
class AuditService {
    async logEvent(entry) {
        await (0, auditLogRepository_1.createAuditLog)({
            ...entry,
            ipAddress: entry.ipAddress ?? '0.0.0.0',
        });
    }
    async getAuditLogs(page, limit) {
        return (0, auditLogRepository_1.listAuditLogs)(page, limit);
    }
}
exports.auditService = new AuditService();
//# sourceMappingURL=auditService.js.map