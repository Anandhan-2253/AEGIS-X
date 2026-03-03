"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlert = createAlert;
exports.listAlerts = listAlerts;
exports.bindAlertsToIncident = bindAlertsToIncident;
const database_1 = require("../config/database");
async function createAlert(entry) {
    const result = await (0, database_1.query)(`
      INSERT INTO alerts (
        title,
        description,
        severity,
        source_ip,
        destination_ip,
        rule_triggered,
        raw_log,
        incident_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
      RETURNING id, title, description, severity, source_ip, destination_ip, rule_triggered,
      raw_log, incident_id, acknowledged, created_at
    `, [
        entry.title,
        entry.description,
        entry.severity,
        entry.sourceIp ?? null,
        entry.destinationIp ?? null,
        entry.ruleTriggered,
        JSON.stringify(entry.rawLog),
        entry.incidentId ?? null,
    ]);
    return result.rows[0];
}
async function listAlerts(page, limit) {
    const offset = (page - 1) * limit;
    const [rowsResult, countResult] = await Promise.all([
        (0, database_1.query)(`
        SELECT id, title, description, severity, source_ip, destination_ip, rule_triggered,
          raw_log, incident_id, acknowledged, created_at
        FROM alerts
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
        (0, database_1.query)('SELECT COUNT(*)::text AS count FROM alerts WHERE deleted_at IS NULL'),
    ]);
    return {
        rows: rowsResult.rows,
        total: Number.parseInt(countResult.rows[0].count, 10),
    };
}
async function bindAlertsToIncident(alertIds, incidentId) {
    if (alertIds.length === 0)
        return;
    await (0, database_1.query)(`
      UPDATE alerts
      SET incident_id = $2, updated_at = NOW()
      WHERE id = ANY($1::uuid[])
    `, [alertIds, incidentId]);
}
//# sourceMappingURL=alertRepository.js.map