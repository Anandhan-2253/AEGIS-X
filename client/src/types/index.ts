export type UserRole = 'ADMIN' | 'SOC_ANALYST' | 'MALWARE_ANALYST' | 'PENTESTER' | 'VIEWER';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED';
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Incident['severity'];
  rule_triggered: string;
  created_at: string;
}

export interface MalwareReport {
  id: string;
  original_name: string;
  mime_type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  risk_score: number | null;
  created_at: string;
  completed_at: string | null;
  ai_analysis: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  created_at: string;
  user_id: string | null;
  details: Record<string, unknown>;
}
