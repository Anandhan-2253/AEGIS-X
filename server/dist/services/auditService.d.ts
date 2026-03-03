import { AuditAction } from '../types';
declare class AuditService {
    logEvent(entry: {
        userId: string | null;
        action: AuditAction;
        resourceType: string;
        resourceId?: string | null;
        details?: Record<string, unknown>;
        ipAddress?: string;
        userAgent: string;
    }): Promise<void>;
    getAuditLogs(page: number, limit: number): Promise<{
        rows: import("../repositories/auditLogRepository").AuditLogRecord[];
        total: number;
    }>;
}
export declare const auditService: AuditService;
export {};
//# sourceMappingURL=auditService.d.ts.map