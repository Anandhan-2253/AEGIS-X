"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const crypto_1 = require("../utils/crypto");
const refreshTokenRepository_1 = require("../repositories/refreshTokenRepository");
const userRepository_1 = require("../repositories/userRepository");
function parseRefreshExpiryMs() {
    const raw = env_1.env.JWT_REFRESH_EXPIRES.trim();
    const match = raw.match(/^(\d+)([mhd])$/i);
    if (!match) {
        return 7 * 24 * 60 * 60 * 1000;
    }
    const value = Number.parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit == 'm')
        return value * 60 * 1000;
    if (unit == 'h')
        return value * 60 * 60 * 1000;
    return value * 24 * 60 * 60 * 1000;
}
class TokenService {
    issueAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
            expiresIn: env_1.env.JWT_ACCESS_EXPIRES,
            issuer: 'aegis-x',
            audience: 'aegis-x-client',
            subject: payload.userId,
        });
    }
    async issueRefreshToken(params) {
        const token = (0, crypto_1.generateSecureToken)(64);
        const tokenHash = (0, crypto_1.hashString)(token);
        const expiresAt = new Date(Date.now() + parseRefreshExpiryMs());
        await (0, refreshTokenRepository_1.createRefreshToken)({
            userId: params.userId,
            tokenHash,
            expiresAt,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
        });
        return token;
    }
    async issueTokenPair(params) {
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
    async rotateRefreshToken(params) {
        const currentHash = (0, crypto_1.hashString)(params.refreshToken);
        const currentRecord = await (0, refreshTokenRepository_1.findActiveRefreshTokenByHash)(currentHash);
        if (!currentRecord) {
            throw new errors_1.AuthenticationError('Refresh token is invalid or expired');
        }
        const user = await (0, userRepository_1.findUserById)(currentRecord.user_id);
        if (!user || !user.is_active) {
            throw new errors_1.AuthenticationError('User account is not active');
        }
        const nextRefreshToken = (0, crypto_1.generateSecureToken)(64);
        const nextRefreshTokenHash = (0, crypto_1.hashString)(nextRefreshToken);
        await (0, refreshTokenRepository_1.revokeRefreshToken)({
            tokenId: currentRecord.id,
            replacedByTokenHash: nextRefreshTokenHash,
        });
        const expiresAt = new Date(Date.now() + parseRefreshExpiryMs());
        await (0, refreshTokenRepository_1.createRefreshToken)({
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
exports.tokenService = new TokenService();
//# sourceMappingURL=tokenService.js.map