import { AuditAction } from '../types';
export interface AuditLogRecord {
    id: string;
    user_id: string | null;
    action: AuditAction;
    resource_type: string;
    resource_id: string | null;
    details: Record<string, unknown>;
    ip_address: string;
    user_agent: string;
    created_at: Date;
}
export declare function createAuditLog(entry: {
    userId: string | null;
    action: AuditAction;
    resourceType: string;
    resourceId?: string | null;
    details?: Record<string, unknown>;
    ipAddress: string;
    userAgent: string;
}): Promise<void>;
export declare function listAuditLogs(page: number, limit: number): Promise<{
    rows: AuditLogRecord[];
    total: number;
}>;
//# sourceMappingURL=auditLogRepository.d.ts.map