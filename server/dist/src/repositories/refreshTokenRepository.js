"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = createRefreshToken;
exports.findActiveRefreshTokenByHash = findActiveRefreshTokenByHash;
exports.revokeRefreshToken = revokeRefreshToken;
exports.revokeAllUserRefreshTokens = revokeAllUserRefreshTokens;
const database_1 = require("../config/database");
async function createRefreshToken(params) {
    await (0, database_1.query)(`
      INSERT INTO refresh_tokens (
        user_id,
        token_hash,
        expires_at,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5)
    `, [params.userId, params.tokenHash, params.expiresAt, params.ipAddress, params.userAgent]);
}
async function findActiveRefreshTokenByHash(tokenHash) {
    const result = await (0, database_1.query)(`
      SELECT id, user_id, token_hash, expires_at, revoked_at, replaced_by_token_hash
      FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `, [tokenHash]);
    return result.rows[0] ?? null;
}
async function revokeRefreshToken(params) {
    await (0, database_1.query)(`
      UPDATE refresh_tokens
      SET revoked_at = NOW(), replaced_by_token_hash = $2
      WHERE id = $1
    `, [params.tokenId, params.replacedByTokenHash ?? null]);
}
async function revokeAllUserRefreshTokens(userId) {
    await (0, database_1.query)(`
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1 AND revoked_at IS NULL
    `, [userId]);
}
//# sourceMappingURL=refreshTokenRepository.js.map