import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticationError } from '../utils/errors';
import { generateSecureToken, hashString } from '../utils/crypto';
import {
  createRefreshToken,
  findActiveRefreshTokenByHash,
  revokeRefreshToken,
} from '../repositories/refreshTokenRepository';
import { findUserById } from '../repositories/userRepository';
import { AuthTokens, TokenPayload } from '../types';

function parseRefreshExpiryMs(): number {
  const raw = env.JWT_REFRESH_EXPIRES.trim();
  const match = raw.match(/^(\d+)([mhd])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (unit == 'm') return value * 60 * 1000;
  if (unit == 'h') return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
}

class TokenService {
  private issueAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
      issuer: 'aegis-x',
      audience: 'aegis-x-client',
      subject: payload.userId,
    });
  }

  private async issueRefreshToken(params: {
    userId: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<string> {
    const token = generateSecureToken(64);
    const tokenHash = hashString(token);
    const expiresAt = new Date(Date.now() + parseRefreshExpiryMs());

    await createRefreshToken({
      userId: params.userId,
      tokenHash,
      expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return token;
  }

  async issueTokenPair(params: {
    userId: string;
    email: string;
    role: TokenPayload['role'];
    ipAddress: string;
    userAgent: string;
  }): Promise<AuthTokens> {
    const accessToken = this.issueAccessToken({
      userId: params.userId,
      email: params.email,
      role: params.role,
    });

    const refreshToken = await this.issueRefreshToken({
      userId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(params: {
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<{ user: NonNullable<Awaited<ReturnType<typeof findUserById>>>; tokens: AuthTokens }> {
    const currentHash = hashString(params.refreshToken);
    const currentRecord = await findActiveRefreshTokenByHash(currentHash);

    if (!currentRecord) {
      throw new AuthenticationError('Refresh token is invalid or expired');
    }

    const user = await findUserById(currentRecord.user_id);
    if (!user || !user.is_active) {
      throw new AuthenticationError('User account is not active');
    }

    const nextRefreshToken = generateSecureToken(64);
    const nextRefreshTokenHash = hashString(nextRefreshToken);

    await revokeRefreshToken({
      tokenId: currentRecord.id,
      replacedByTokenHash: nextRefreshTokenHash,
    });

    const expiresAt = new Date(Date.now() + parseRefreshExpiryMs());
    await createRefreshToken({
      userId: user.id,
      tokenHash: nextRefreshTokenHash,
      expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const accessToken = this.issueAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      tokens: {
        accessToken,
        refreshToken: nextRefreshToken,
      },
    };
  }
}

export const tokenService = new TokenService();
