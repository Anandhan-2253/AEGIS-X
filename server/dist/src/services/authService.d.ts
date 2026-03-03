import { UserRole } from '../types';
declare class AuthService {
    register(input: {
        email: string;
        username: string;
        password: string;
        ipAddress: string;
        userAgent: string;
    }): Promise<{
        user: import("../types").SafeUser;
        tokens: import("../types").AuthTokens;
    }>;
    login(input: {
        email: string;
        password: string;
        ipAddress: string;
        userAgent: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            role: UserRole;
            isActive: true;
            createdAt: string;
        };
        tokens: import("../types").AuthTokens;
    }>;
    refresh(input: {
        refreshToken: string;
        ipAddress: string;
        userAgent: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            role: UserRole;
            isActive: boolean;
            createdAt: string;
        };
        tokens: import("../types").AuthTokens;
    }>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=authService.d.ts.map