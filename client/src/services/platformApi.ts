import api from './api';
import { Alert, AuditLog, Incident, MalwareReport } from '../types';

export const platformApi = {
  async health() {
    const response = await api.get('/health');
    return response.data.data;
  },

  async listIncidents(page = 1, limit = 20) {
    const response = await api.get<{ data: Incident[] }>('/soc/incidents', { params: { page, limit } });
    return response.data.data;
  },

  async listAlerts(page = 1, limit = 20) {
    const response = await api.get<{ data: Alert[] }>('/soc/alerts', { params: { page, limit } });
    return response.data.data;
  },

  async getIncidentTimeline(incidentId: string) {
    const response = await api.get(`/soc/incidents/${incidentId}/timeline`);
    return response.data.data;
  },

  async ingestLog(payload: Record<string, unknown>) {
    const response = await api.post('/soc/logs/ingest', payload);
    return response.data.data;
  },

  async uploadMalware(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/malware/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async listMalwareReports(page = 1, limit = 20) {
    const response = await api.get<{ data: MalwareReport[] }>('/malware/reports', { params: { page, limit } });
    return response.data.data;
  },

  async analyzeJWT(token: string) {
    const response = await api.post('/pentest/jwt/analyze', { token });
    return response.data.data;
  },

  async checkHeaders(url: string) {
    const response = await api.post('/pentest/headers/check', { url, headers: {} });
    return response.data.data;
  },

  async portScan(target: string, rangeStart: number, rangeEnd: number) {
    const response = await api.post('/pentest/port-scan', {
      target,
      rangeStart,
      rangeEnd,
    });
    return response.data.data;
  },

  async listUsers(page = 1, limit = 20) {
    const response = await api.get('/admin/users', { params: { page, limit } });
    return response.data.data;
  },

  async updateUserRole(userId: string, role: string) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data.data;
  },

  async listAuditLogs(page = 1, limit = 20) {
    const response = await api.get<{ data: AuditLog[] }>('/admin/audit-logs', { params: { page, limit } });
    return response.data.data;
  },
};
