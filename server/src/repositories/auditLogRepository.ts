import { query } from '../config/database';
import { AuditAction } from '../types';

export interface AuditLogRecord {
  id: string;
  user_id: string | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

export async function createAuditLog(entry: {
  userId: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}): Promise<void> {
  await query(
    `
      INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
    `,
    [
      entry.userId,
      entry.action,
      entry.resourceType,
      entry.resourceId ?? null,
      JSON.stringify(entry.details ?? {}),
      entry.ipAddress,
      entry.userAgent,
    ],
  );
}

export async function listAuditLogs(page: number, limit: number): Promise<{ rows: AuditLogRecord[]; total: number }> {
  const offset = (page - 1) * limit;
  const [rowsResult, countResult] = await Promise.all([
    query<AuditLogRecord>(
      `
        SELECT id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    ),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM audit_logs'),
  ]);

  return {
    rows: rowsResult.rows,
    total: Number.parseInt(countResult.rows[0].count, 10),
  };
}
