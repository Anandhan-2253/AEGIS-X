"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertThreatIntel = upsertThreatIntel;
exports.findThreatIntel = findThreatIntel;
exports.listThreatIntel = listThreatIntel;
const database_1 = require("../config/database");
async function upsertThreatIntel(entry) {
    const result = await (0, database_1.query)(`
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
    `, [
        entry.iocType,
        entry.iocValue,
        entry.threatType,
        entry.confidence,
        entry.riskScore,
        entry.source,
        entry.description,
    ]);
    return result.rows[0];
}
async function findThreatIntel(iocType, iocValue) {
    const result = await (0, database_1.query)(`
      SELECT id, ioc_type, ioc_value, threat_type, confidence, risk_score,
        source, description, first_seen, last_seen, active, created_at
      FROM threat_intel
      WHERE ioc_type = $1 AND ioc_value = $2 AND deleted_at IS NULL
      LIMIT 1
    `, [iocType, iocValue]);
    return result.rows[0] ?? null;
}
async function listThreatIntel(page, limit) {
    const offset = (page - 1) * limit;
    const [rowsResult, countResult] = await Promise.all([
        (0, database_1.query)(`
        SELECT id, ioc_type, ioc_value, threat_type, confidence, risk_score,
          source, description, first_seen, last_seen, active, created_at
        FROM threat_intel
        WHERE deleted_at IS NULL
        ORDER BY last_seen DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
        (0, database_1.query)('SELECT COUNT(*)::text AS count FROM threat_intel WHERE deleted_at IS NULL'),
    ]);
    return {
        rows: rowsResult.rows,
        total: Number.parseInt(countResult.rows[0].count, 10),
    };
}
//# sourceMappingURL=threatIntelRepository.js.map