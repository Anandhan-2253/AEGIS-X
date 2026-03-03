import { findUserById } from '../repositories/userRepository';
import { AuthTokens, TokenPayload } from '../types';
declare class TokenService {
    private issueAccessToken;
    private issueRefreshToken;
    issueTokenPair(params: {
        userId: string;
        email: string;
        role: TokenPayload['role'];
        ipAddress: string;
        userAgent: string;
    }): Promise<AuthTokens>;
    rotateRefreshToken(params: {
        refreshToken: string;
        ipAddress: string;
        userAgent: string;
    }): Promise<{
        user: NonNullable<Awaited<ReturnType<typeof findUserById>>>;
        tokens: AuthTokens;
    }>;
}
export declare const tokenService: TokenService;
export {};
//# sourceMappingURL=tokenService.d.ts.map