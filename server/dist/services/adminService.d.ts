import { UserRole } from '../types';
declare class AdminService {
    listUsers(page: number, limit: number): Promise<{
        users: import("../types").SafeUser[];
        total: number;
    }>;
    setUserRole(userId: string, role: UserRole): Promise<import("../types").SafeUser>;
    setUserStatus(userId: string, isActive: boolean): Promise<import("../types").SafeUser>;
    listAuditLogs(page: number, limit: number): Promise<{
        rows: import("../repositories/auditLogRepository").AuditLogRecord[];
        total: number;
    }>;
}
export declare const adminService: AdminService;
export {};
//# sourceMappingURL=adminService.d.ts.map