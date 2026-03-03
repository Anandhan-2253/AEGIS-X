import { SafeUser, UserRole } from '../types';
export interface UserRecord {
    id: string;
    email: string;
    username: string;
    password_hash: string;
    role: UserRole;
    is_active: boolean;
    created_at: Date;
}
export declare function createUser(params: {
    email: string;
    username: string;
    passwordHash: string;
    role: UserRole;
}): Promise<SafeUser>;
export declare function findUserByEmail(email: string): Promise<UserRecord | null>;
export declare function findUserById(userId: string): Promise<UserRecord | null>;
export declare function listUsers(page: number, limit: number): Promise<{
    users: SafeUser[];
    total: number;
}>;
export declare function updateUserRole(userId: string, role: UserRole): Promise<SafeUser | null>;
export declare function updateUserStatus(userId: string, isActive: boolean): Promise<SafeUser | null>;
//# sourceMappingURL=userRepository.d.ts.map