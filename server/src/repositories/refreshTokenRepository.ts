import { query } from '../config/database';

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  replaced_by_token_hash: string | null;
}

export async function createRefreshToken(params: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}): Promise<void> {
  await query(
    `
      INSERT INTO refresh_tokens (
        user_id,
        token_hash,
        expires_at,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5)
    `,
    [params.userId, params.tokenHash, params.expiresAt, params.ipAddress, params.userAgent],
  );
}

export async function findActiveRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
  const result = await query<RefreshTokenRecord>(
    `
      SELECT id, user_id, token_hash, expires_at, revoked_at, replaced_by_token_hash
      FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}

export async function revokeRefreshToken(params: {
  tokenId: string;
  replacedByTokenHash?: string;
}): Promise<void> {
  await query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW(), replaced_by_token_hash = $2
      WHERE id = $1
    `,
    [params.tokenId, params.replacedByTokenHash ?? null],
  );
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1 AND revoked_at IS NULL
    `,
    [userId],
  );
}
