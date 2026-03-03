"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.listAuditLogs = listAuditLogs;
const database_1 = require("../config/database");
async function createAuditLog(entry) {
    await (0, database_1.query)(`
      INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
    `, [
        entry.userId,
        entry.action,
        entry.resourceType,
        entry.resourceId ?? null,
        JSON.stringify(entry.details ?? {}),
        entry.ipAddress,
        entry.userAgent,
    ]);
}
async function listAuditLogs(page, limit) {
    const offset = (page - 1) * limit;
    const [rowsResult, countResult] = await Promise.all([
        (0, database_1.query)(`
        SELECT id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
        (0, database_1.query)('SELECT COUNT(*)::text AS count FROM audit_logs'),
    ]);
    return {
        rows: rowsResult.rows,
        total: Number.parseInt(countResult.rows[0].count, 10),
    };
}
//# sourceMappingURL=auditLogRepository.js.map