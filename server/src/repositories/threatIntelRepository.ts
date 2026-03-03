import { query } from '../config/database';

export interface ThreatIntelRecord {
  id: string;
  ioc_type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  ioc_value: string;
  threat_type: string;
  confidence: number;
  risk_score: number;
  source: string;
  description: string;
  first_seen: Date;
  last_seen: Date;
  active: boolean;
  created_at: Date;
}

export async function upsertThreatIntel(entry: {
  iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  iocValue: string;
  threatType: string;
  confidence: number;
  riskScore: number;
  source: string;
  description: string;
}): Promise<ThreatIntelRecord> {
  const result = await query<ThreatIntelRecord>(
    `
      INSERT INTO threat_intel (
        ioc_type,
        ioc_value,
        threat_type,
        confidence,
        risk_score,
        source,
        description,
        first_seen,
        last_seen,
        active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), true)
      ON CONFLICT (ioc_type, ioc_value)
      DO UPDATE SET
        threat_type = EXCLUDED.threat_type,
        confidence = EXCLUDED.confidence,
        risk_score = EXCLUDED.risk_score,
        source = EXCLUDED.source,
        description = EXCLUDED.description,
        last_seen = NOW(),
        active = true,
        updated_at = NOW()
      RETURNING id, ioc_type, ioc_value, threat_type, confidence, risk_score, source,
        description, first_seen, last_seen, active, created_at
    `,
    [
      entry.iocType,
      entry.iocValue,
      entry.threatType,
      entry.confidence,
      entry.riskScore,
      entry.source,
      entry.description,
    ],
  );

  return result.rows[0];
}

export async function findThreatIntel(iocType: string, iocValue: string): Promise<ThreatIntelRecord | null> {
  const result = await query<ThreatIntelRecord>(
    `
      SELECT id, ioc_type, ioc_value, threat_type, confidence, risk_score,
        source, description, first_seen, last_seen, active, created_at
      FROM threat_intel
      WHERE ioc_type = $1 AND ioc_value = $2 AND deleted_at IS NULL
      LIMIT 1
    `,
    [iocType, iocValue],
  );

  return result.rows[0] ?? null;
}

export async function listThreatIntel(page: number, limit: number): Promise<{ rows: ThreatIntelRecord[]; total: number }> {
  const offset = (page - 1) * limit;
  const [rowsResult, countResult] = await Promise.all([
    query<ThreatIntelRecord>(
      `
        SELECT id, ioc_type, ioc_value, threat_type, confidence, risk_score,
          source, description, first_seen, last_seen, active, created_at
        FROM threat_intel
        WHERE deleted_at IS NULL
        ORDER BY last_seen DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    ),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM threat_intel WHERE deleted_at IS NULL'),
  ]);

  return {
    rows: rowsResult.rows,
    total: Number.parseInt(countResult.rows[0].count, 10),
  };
}
