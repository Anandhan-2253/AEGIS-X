"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userRepository_1 = require("../repositories/userRepository");
const errors_1 = require("../utils/errors");
const tokenService_1 = require("./tokenService");
const types_1 = require("../types");
const auditService_1 = require("./auditService");
class AuthService {
    async register(input) {
        const existingUser = await (0, userRepository_1.findUserByEmail)(input.email);
        if (existingUser) {
            throw new errors_1.ConflictError('Email is already registered');
        }
        const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
        try {
            const user = await (0, userRepository_1.createUser)({
                email: input.email,
                username: input.username,
                passwordHash,
                role: types_1.UserRole.VIEWER,
            });
            const tokens = await tokenService_1.tokenService.issueTokenPair({
                userId: user.id,
                email: user.email,
                role: user.role,
                ipAddress: input.ipAddress,
                userAgent: input.userAgent,
            });
            await auditService_1.auditService.logEvent({
                userId: user.id,
                action: types_1.AuditAction.USER_REGISTER,
                resourceType: 'user',
                resourceId: user.id,
                details: { email: user.email, role: user.role },
                ipAddress: input.ipAddress,
                userAgent: input.userAgent,
            });
            return { user, tokens };
        }
        catch (error) {
            const pgError = error;
            if (pgError?.code === '23505') {
                throw new errors_1.ConflictError('User registration conflict');
            }
            throw error;
        }
    }
    async login(input) {
        const userRecord = await (0, userRepository_1.findUserByEmail)(input.email);
        if (!userRecord || !userRecord.is_active) {
            throw new errors_1.AuthenticationError('Invalid credentials');
        }
        const validPassword = await bcryptjs_1.default.compare(input.password, userRecord.password_hash);
        if (!validPassword) {
            throw new errors_1.AuthenticationError('Invalid credentials');
        }
        const tokens = await tokenService_1.tokenService.issueTokenPair({
            userId: userRecord.id,
            email: userRecord.email,
            role: userRecord.role,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        });
        await auditService_1.auditService.logEvent({
            userId: userRecord.id,
            action: types_1.AuditAction.USER_LOGIN,
            resourceType: 'user',
            resourceId: userRecord.id,
            details: { email: userRecord.email },
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        });
        return {
            user: {
                id: userRecord.id,
                email: userRecord.email,
                username: userRecord.username,
                role: userRecord.role,
                isActive: userRecord.is_active,
                createdAt: userRecord.created_at.toISOString(),
            },
            tokens,
        };
    }
    async refresh(input) {
        const rotated = await tokenService_1.tokenService.rotateRefreshToken(input);
        await auditService_1.auditService.logEvent({
            userId: rotated.user.id,
            action: types_1.AuditAction.TOKEN_REFRESH,
            resourceType: 'token',
            resourceId: rotated.user.id,
            details: { role: rotated.user.role },
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        });
        return {
            user: {
                id: rotated.user.id,
                email: rotated.user.email,
                username: rotated.user.username,
                role: rotated.user.role,
                isActive: rotated.user.is_active,
                createdAt: rotated.user.created_at.toISOString(),
            },
            tokens: rotated.tokens,
        };
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map