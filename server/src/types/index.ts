export enum UserRole {
  ADMIN = 'ADMIN',
  SOC_ANALYST = 'SOC_ANALYST',
  MALWARE_ANALYST = 'MALWARE_ANALYST',
  PENTESTER = 'PENTESTER',
  VIEWER = 'VIEWER',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
}

export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum AnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum AuditAction {
  USER_REGISTER = 'USER_REGISTER',
  USER_LOGIN = 'USER_LOGIN',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  INCIDENT_CREATE = 'INCIDENT_CREATE',
  INCIDENT_UPDATE = 'INCIDENT_UPDATE',
  ALERT_CREATE = 'ALERT_CREATE',
  MALWARE_UPLOAD = 'MALWARE_UPLOAD',
  MALWARE_ANALYSIS = 'MALWARE_ANALYSIS',
  THREAT_INTEL_QUERY = 'THREAT_INTEL_QUERY',
  PENTEST_SCAN = 'PENTEST_SCAN',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
}

export enum SocketEvent {
  ALERT_NEW = 'alert:new',
  INCIDENT_CREATED = 'incident:created',
  INCIDENT_UPDATED = 'incident:updated',
  ANALYSIS_COMPLETE = 'analysis:complete',
  WORKER_STATUS = 'worker:status',
}

export enum JobType {
  MALWARE_ANALYSIS = 'malware_analysis',
  AI_SUMMARIZATION = 'ai_summarization',
  THREAT_CLASSIFICATION = 'threat_classification',
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  requestId?: string;
}

export interface MalwareAnalysisJobData {
  reportId: string;
  filePath: string;
  originalName: string;
  mimeType: string;
  uploadedBy: string;
}

export interface AISummarizationJobData {
  targetType: 'incident' | 'malware' | 'threat';
  targetId: string;
  content: string;
}

export interface ThreatClassificationJobData {
  logId: string;
  source: string;
  message: string;
  rawData: Record<string, unknown>;
}

export interface HeaderAnalysisResult {
  header: string;
  present: boolean;
  value: string | null;
  status: 'pass' | 'warn' | 'fail';
  recommendation: string;
}

export interface PortScanResult {
  port: number;
  service: string;
  state: 'open' | 'closed' | 'filtered';
  risk: Severity;
}

export interface JWTAnalysisResult {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  issues: string[];
  recommendations: string[];
}

export interface MitreMapping {
  tacticId: string;
  tacticName: string;
  techniqueId: string;
  techniqueName: string;
  description: string;
}

export interface QueueHealth {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}
