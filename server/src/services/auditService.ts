import { AuditAction } from '../types';
import { createAuditLog, listAuditLogs } from '../repositories/auditLogRepository';

class AuditService {
  async logEvent(entry: {
    userId: string | null;
    action: AuditAction;
    resourceType: string;
    resourceId?: string | null;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent: string;
  }): Promise<void> {
    await createAuditLog({
      ...entry,
      ipAddress: entry.ipAddress ?? '0.0.0.0',
    });
  }

  async getAuditLogs(page: number, limit: number) {
    return listAuditLogs(page, limit);
  }
}

export const auditService = new AuditService();
