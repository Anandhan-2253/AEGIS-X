import { listAuditLogs } from '../repositories/auditLogRepository';
import {
  listUsers,
  updateUserRole,
  updateUserStatus,
} from '../repositories/userRepository';
import { UserRole } from '../types';
import { NotFoundError } from '../utils/errors';

class AdminService {
  async listUsers(page: number, limit: number) {
    return listUsers(page, limit);
  }

  async setUserRole(userId: string, role: UserRole) {
    const updated = await updateUserRole(userId, role);
    if (!updated) throw new NotFoundError('User');
    return updated;
  }

  async setUserStatus(userId: string, isActive: boolean) {
    const updated = await updateUserStatus(userId, isActive);
    if (!updated) throw new NotFoundError('User');
    return updated;
  }

  async listAuditLogs(page: number, limit: number) {
    return listAuditLogs(page, limit);
  }
}

export const adminService = new AdminService();
