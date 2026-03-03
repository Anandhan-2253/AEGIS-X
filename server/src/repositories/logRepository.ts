import { query } from '../config/database';
import { Severity } from '../types';

export interface SecurityLogRecord {
  id: string;
  source: string;
  log_type: string;
  severity: Severity;
  message: string;
  raw_data: Record<string, unknown>;
  source_ip: string | null;
  destination_ip: string | null;
  event_timestamp: Date;
  ingested_at: Date;
}

export async function createLog(entry: {
  source: string;
  logType: string;
  severity: Severity;
  message: string;
  rawData: Record<string, unknown>;
  sourceIp?: string | null;
  destinationIp?: string | null;
  eventTimestamp?: Date;
}): Promise<SecurityLogRecord> {
  const result = await query<SecurityLogRecord>(
    `
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
    `,
    [
      entry.source,
      entry.logType,
      entry.severity,
      entry.message,
      JSON.stringify(entry.rawData),
      entry.sourceIp ?? null,
      entry.destinationIp ?? null,
      entry.eventTimestamp ?? new Date(),
    ],
  );

  return result.rows[0];
}

export async function listLogs(page: number, limit: number): Promise<{ rows: SecurityLogRecord[]; total: number }> {
  const offset = (page - 1) * limit;

  const [rowsResult, countResult] = await Promise.all([
    query<SecurityLogRecord>(
      `
        SELECT id, source, log_type, severity, message, raw_data, source_ip, destination_ip, event_timestamp, ingested_at
        FROM logs
        WHERE deleted_at IS NULL
        ORDER BY ingested_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    ),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM logs WHERE deleted_at IS NULL'),
  ]);

  return {
    rows: rowsResult.rows,
    total: Number.parseInt(countResult.rows[0].count, 10),
  };
}
