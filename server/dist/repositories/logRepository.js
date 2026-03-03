"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLog = createLog;
exports.listLogs = listLogs;
const database_1 = require("../config/database");
async function createLog(entry) {
    const result = await (0, database_1.query)(`
      INSERT INTO logs (
        source,
        log_type,
        severity,
        message,
        raw_data,
        source_ip,
        destination_ip,
        event_timestamp
      ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
      RETURNING id, source, log_type, severity, message, raw_data, source_ip, destination_ip, event_timestamp, ingested_at
    `, [
        entry.source,
        entry.logType,
        entry.severity,
        entry.message,
        JSON.stringify(entry.rawData),
        entry.sourceIp ?? null,
        entry.destinationIp ?? null,
        entry.eventTimestamp ?? new Date(),
    ]);
    return result.rows[0];
}
async function listLogs(page, limit) {
    const offset = (page - 1) * limit;
    const [rowsResult, countResult] = await Promise.all([
        (0, database_1.query)(`
        SELECT id, source, log_type, severity, message, raw_data, source_ip, destination_ip, event_timestamp, ingested_at
        FROM logs
        WHERE deleted_at IS NULL
        ORDER BY ingested_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
        (0, database_1.query)('SELECT COUNT(*)::text AS count FROM logs WHERE deleted_at IS NULL'),
    ]);
    return {
        rows: rowsResult.rows,
        total: Number.parseInt(countResult.rows[0].count, 10),
    };
}
//# sourceMappingURL=logRepository.js.map