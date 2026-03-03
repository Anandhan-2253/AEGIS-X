import { query } from '../config/database';
import { Severity } from '../types';

export interface AlertRecord {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  source_ip: string | null;
  destination_ip: string | null;
  rule_triggered: string;
  raw_log: Record<string, unknown>;
  incident_id: string | null;
  acknowledged: boolean;
  created_at: Date;
}

export async function createAlert(entry: {
  title: string;
  description: string;
  severity: Severity;
  sourceIp?: string | null;
  destinationIp?: string | null;
  ruleTriggered: string;
  rawLog: Record<string, unknown>;
  incidentId?: string | null;
}): Promise<AlertRecord> {
  const result = await query<AlertRecord>(
    `
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
    `,
    [
      entry.title,
      entry.description,
      entry.severity,
      entry.sourceIp ?? null,
      entry.destinationIp ?? null,
      entry.ruleTriggered,
      JSON.stringify(entry.rawLog),
      entry.incidentId ?? null,
    ],
  );

  return result.rows[0];
}

export async function listAlerts(page: number, limit: number): Promise<{ rows: AlertRecord[]; total: number }> {
  const offset = (page - 1) * limit;

  const [rowsResult, countResult] = await Promise.all([
    query<AlertRecord>(
      `
        SELECT id, title, description, severity, source_ip, destination_ip, rule_triggered,
          raw_log, incident_id, acknowledged, created_at
        FROM alerts
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    ),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM alerts WHERE deleted_at IS NULL'),
  ]);

  return {
    rows: rowsResult.rows,
    total: Number.parseInt(countResult.rows[0].count, 10),
  };
}

export async function bindAlertsToIncident(alertIds: string[], incidentId: string): Promise<void> {
  if (alertIds.length === 0) return;

  await query(
    `
      UPDATE alerts
      SET incident_id = $2, updated_at = NOW()
      WHERE id = ANY($1::uuid[])
    `,
    [alertIds, incidentId],
  );
}
