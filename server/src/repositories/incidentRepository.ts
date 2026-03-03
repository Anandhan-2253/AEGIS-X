import { query } from '../config/database';
import { IncidentStatus, Severity } from '../types';

export interface IncidentRecord {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  assigned_to: string | null;
  mitre_tactic: string | null;
  mitre_technique: string | null;
  source: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  resolved_at: Date | null;
}

export interface IncidentEventRecord {
  id: string;
  incident_id: string;
  event_type: string;
  description: string;
  actor_id: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export async function createIncident(entry: {
  title: string;
  description: string;
  severity: Severity;
  status?: IncidentStatus;
  assignedTo?: string | null;
  mitreTactic?: string | null;
  mitreTechnique?: string | null;
  source: string;
  createdBy: string;
}): Promise<IncidentRecord> {
  const result = await query<IncidentRecord>(
    `
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
    `,
    [
      entry.title,
      entry.description,
      entry.severity,
      entry.status ?? IncidentStatus.OPEN,
      entry.assignedTo ?? null,
      entry.mitreTactic ?? null,
      entry.mitreTechnique ?? null,
      entry.source,
      entry.createdBy,
    ],
  );

  return result.rows[0];
}

export async function updateIncident(
  incidentId: string,
  updates: Partial<{
    title: string;
    description: string;
    severity: Severity;
    status: IncidentStatus;
    assignedTo: string | null;
    mitreTactic: string | null;
    mitreTechnique: string | null;
  }>,
): Promise<IncidentRecord | null> {
  const result = await query<IncidentRecord>(
    `
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
    `,
    [
      incidentId,
      updates.title ?? null,
      updates.description ?? null,
      updates.severity ?? null,
      updates.status ?? null,
      updates.assignedTo ?? null,
      updates.mitreTactic ?? null,
      updates.mitreTechnique ?? null,
    ],
  );

  return result.rows[0] ?? null;
}

export async function findIncidentById(incidentId: string): Promise<IncidentRecord | null> {
  const result = await query<IncidentRecord>(
    `
      SELECT id, title, description, severity, status, assigned_to, mitre_tactic,
        mitre_technique, source, created_by, created_at, updated_at, resolved_at
      FROM incidents
      WHERE id = $1 AND deleted_at IS NULL
      LIMIT 1
    `,
    [incidentId],
  );

  return result.rows[0] ?? null;
}

export async function listIncidents(page: number, limit: number): Promise<{ rows: IncidentRecord[]; total: number }> {
  const offset = (page - 1) * limit;
  const [rowsResult, countResult] = await Promise.all([
    query<IncidentRecord>(
      `
        SELECT id, title, description, severity, status, assigned_to, mitre_tactic,
          mitre_technique, source, created_by, created_at, updated_at, resolved_at
        FROM incidents
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    ),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM incidents WHERE deleted_at IS NULL'),
  ]);

  return {
    rows: rowsResult.rows,
    total: Number.parseInt(countResult.rows[0].count, 10),
  };
}

export async function createIncidentEvent(entry: {
  incidentId: string;
  eventType: string;
  description: string;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await query(
    `
      INSERT INTO incident_events (
        incident_id,
        event_type,
        description,
        actor_id,
        metadata
      ) VALUES ($1, $2, $3, $4, $5::jsonb)
    `,
    [entry.incidentId, entry.eventType, entry.description, entry.actorId ?? null, JSON.stringify(entry.metadata ?? {})],
  );
}

export async function getIncidentTimeline(incidentId: string): Promise<IncidentEventRecord[]> {
  const result = await query<IncidentEventRecord>(
    `
      SELECT id, incident_id, event_type, description, actor_id, metadata, created_at
      FROM incident_events
      WHERE incident_id = $1
      ORDER BY created_at ASC
    `,
    [incidentId],
  );

  return result.rows;
}
