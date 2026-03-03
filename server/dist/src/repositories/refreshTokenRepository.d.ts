export interface RefreshTokenRecord {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
    revoked_at: Date | null;
    replaced_by_token_hash: string | null;
}
export declare function createRefreshToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
}): Promise<void>;
export declare function findActiveRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
export declare function revokeRefreshToken(params: {
    tokenId: string;
    replacedByTokenHash?: string;
}): Promise<void>;
export declare function revokeAllUserRefreshTokens(userId: string): Promise<void>;
//# sourceMappingURL=refreshTokenRepository.d.ts.map