"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIncident = createIncident;
exports.updateIncident = updateIncident;
exports.findIncidentById = findIncidentById;
exports.listIncidents = listIncidents;
exports.createIncidentEvent = createIncidentEvent;
exports.getIncidentTimeline = getIncidentTimeline;
const database_1 = require("../config/database");
const types_1 = require("../types");
async function createIncident(entry) {
    const result = await (0, database_1.query)(`
      INSERT INTO incidents (
        title,
        description,
        severity,
        status,
        assigned_to,
        mitre_tactic,
        mitre_technique,
        source,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, description, severity, status, assigned_to, mitre_tactic,
        mitre_technique, source, created_by, created_at, updated_at, resolved_at
    `, [
        entry.title,
        entry.description,
        entry.severity,
        entry.status ?? types_1.IncidentStatus.OPEN,
        entry.assignedTo ?? null,
        entry.mitreTactic ?? null,
        entry.mitreTechnique ?? null,
        entry.source,
        entry.createdBy,
    ]);
    return result.rows[0];
}
async function updateIncident(incidentId, updates) {
    const result = await (0, database_1.query)(`
      UPDATE incidents
      SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        severity = COALESCE($4, severity),
        status = COALESCE($5, status),
        assigned_to = COALESCE($6, assigned_to),
        mitre_tactic = COALESCE($7, mitre_tactic),
        mitre_technique = COALESCE($8, mitre_technique),
        resolved_at = CASE WHEN $5 = 'RESOLVED' THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, title, description, severity, status, assigned_to, mitre_tactic,
        mitre_technique, source, created_by, created_at, updated_at, resolved_at
    `, [
        incidentId,
        updates.title ?? null,
        updates.description ?? null,
        updates.severity ?? null,
        updates.status ?? null,
        updates.assignedTo ?? null,
        updates.mitreTactic ?? null,
        updates.mitreTechnique ?? null,
    ]);
    return result.rows[0] ?? null;
}
async function findIncidentById(incidentId) {
    const result = await (0, database_1.query)(`
      SELECT id, title, description, severity, status, assigned_to, mitre_tactic,
        mitre_technique, source, created_by, created_at, updated_at, resolved_at
      FROM incidents
      WHERE id = $1 AND deleted_at IS NULL
      LIMIT 1
    `, [incidentId]);
    return result.rows[0] ?? null;
}
async function listIncidents(page, limit) {
    const offset = (page - 1) * limit;
    const [rowsResult, countResult] = await Promise.all([
        (0, database_1.query)(`
        SELECT id, title, description, severity, status, assigned_to, mitre_tactic,
          mitre_technique, source, created_by, created_at, updated_at, resolved_at
        FROM incidents
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
        (0, database_1.query)('SELECT COUNT(*)::text AS count FROM incidents WHERE deleted_at IS NULL'),
    ]);
    return {
        rows: rowsResult.rows,
        total: Number.parseInt(countResult.rows[0].count, 10),
    };
}
async function createIncidentEvent(entry) {
    await (0, database_1.query)(`
      INSERT INTO incident_events (
        incident_id,
        event_type,
        description,
        actor_id,
        metadata
      ) VALUES ($1, $2, $3, $4, $5::jsonb)
    `, [entry.incidentId, entry.eventType, entry.description, entry.actorId ?? null, JSON.stringify(entry.metadata ?? {})]);
}
async function getIncidentTimeline(incidentId) {
    const result = await (0, database_1.query)(`
      SELECT id, incident_id, event_type, description, actor_id, metadata, created_at
      FROM incident_events
      WHERE incident_id = $1
      ORDER BY created_at ASC
    `, [incidentId]);
    return result.rows;
}
//# sourceMappingURL=incidentRepository.js.map