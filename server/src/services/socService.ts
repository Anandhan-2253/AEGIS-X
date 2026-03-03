import {
  bindAlertsToIncident,
  createAlert,
  listAlerts,
} from '../repositories/alertRepository';
import {
  createIncident,
  createIncidentEvent,
  findIncidentById,
  getIncidentTimeline,
  listIncidents,
  updateIncident,
} from '../repositories/incidentRepository';
import { createLog, listLogs } from '../repositories/logRepository';
import { MITRE_MAPPINGS } from '../models/mitreAttack';
import {
  AuditAction,
  IncidentStatus,
  Severity,
  SocketEvent,
} from '../types';
import { NotFoundError } from '../utils/errors';
import { emitSocketEvent } from '../config/socket';
import { auditService } from './auditService';
import { threatIntelService } from './threatIntelService';
import { workerService } from './workerService';

const severityScoreMap: Record<Severity, number> = {
  [Severity.INFO]: 10,
  [Severity.LOW]: 25,
  [Severity.MEDIUM]: 45,
  [Severity.HIGH]: 70,
  [Severity.CRITICAL]: 90,
};

const suspiciousRules: Array<{ pattern: RegExp; score: number; reason: string }> = [
  { pattern: /failed\s+login|brute\s*force/i, score: 18, reason: 'authentication_attack_pattern' },
  { pattern: /powershell|cmd\.exe|rundll32|regsvr32/i, score: 22, reason: 'suspicious_execution' },
  { pattern: /mimikatz|lsass|credential/i, score: 25, reason: 'credential_access_indicator' },
  { pattern: /encrypt|ransom|locker/i, score: 30, reason: 'ransomware_behavior' },
  { pattern: /exfil|data\s+transfer|upload\s+large/i, score: 24, reason: 'exfiltration_pattern' },
  { pattern: /c2|beacon|reverse\s+shell/i, score: 28, reason: 'command_control_pattern' },
];

class SOCService {
  private computeSeverityScore(input: {
    severity: Severity;
    message: string;
    rawData: Record<string, unknown>;
  }): { score: number; rules: string[] } {
    let score = severityScoreMap[input.severity] ?? 10;
    const rules: string[] = [];

    const body = `${input.message} ${JSON.stringify(input.rawData)}`;
    for (const rule of suspiciousRules) {
      if (rule.pattern.test(body)) {
        score += rule.score;
        rules.push(rule.reason);
      }
    }

    if (body.length > 5000) {
      score += 5;
      rules.push('high_volume_log_payload');
    }

    return {
      score: Math.min(100, score),
      rules,
    };
  }

  private mapScoreToSeverity(score: number): Severity {
    if (score >= 90) return Severity.CRITICAL;
    if (score >= 75) return Severity.HIGH;
    if (score >= 50) return Severity.MEDIUM;
    if (score >= 30) return Severity.LOW;
    return Severity.INFO;
  }

  private mapMitre(input: { logType: string; message: string }) {
    const corpus = `${input.logType} ${input.message}`.toLowerCase();

    const keywordMap: Array<{ keywords: string[]; techniqueId: string }> = [
      { keywords: ['powershell', 'cmd', 'script'], techniqueId: 'T1059' },
      { keywords: ['mimikatz', 'credential', 'lsass'], techniqueId: 'T1003' },
      { keywords: ['ransom', 'encrypt', 'obfusc'], techniqueId: 'T1027' },
      { keywords: ['remote', 'rdp', 'smb'], techniqueId: 'T1021' },
      { keywords: ['exfil', 'upload', 'beacon'], techniqueId: 'T1048' },
    ];

    const matched = keywordMap.find(entry => entry.keywords.some(keyword => corpus.includes(keyword)));
    if (!matched) return null;

    return MITRE_MAPPINGS.find(mapping => mapping.techniqueId === matched.techniqueId) ?? null;
  }

  async ingestLog(input: {
    source: string;
    logType: string;
    severity: Severity;
    message: string;
    rawData: Record<string, unknown>;
    sourceIp?: string | null;
    destinationIp?: string | null;
    eventTimestamp?: Date;
    actorId?: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const logRecord = await createLog({
      source: input.source,
      logType: input.logType,
      severity: input.severity,
      message: input.message,
      rawData: input.rawData,
      sourceIp: input.sourceIp,
      destinationIp: input.destinationIp,
      eventTimestamp: input.eventTimestamp,
    });

    const scoring = this.computeSeverityScore({
      severity: input.severity,
      message: input.message,
      rawData: input.rawData,
    });

    const normalizedSeverity = this.mapScoreToSeverity(scoring.score);

    let alert = null;
    let incident = null;

    if (scoring.score >= 50) {
      alert = await createAlert({
        title: `Alert: ${input.logType}`,
        description: input.message.slice(0, 500),
        severity: normalizedSeverity,
        sourceIp: input.sourceIp,
        destinationIp: input.destinationIp,
        ruleTriggered: scoring.rules.join(',') || 'severity_threshold',
        rawLog: {
          logId: logRecord.id,
          score: scoring.score,
          rules: scoring.rules,
          raw: input.rawData,
        },
      });

      emitSocketEvent(SocketEvent.ALERT_NEW, {
        alertId: alert.id,
        severity: alert.severity,
        title: alert.title,
        createdAt: alert.created_at,
      });

      await auditService.logEvent({
        userId: input.actorId ?? null,
        action: AuditAction.ALERT_CREATE,
        resourceType: 'alert',
        resourceId: alert.id,
        details: {
          score: scoring.score,
          rules: scoring.rules,
          logId: logRecord.id,
        },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
    }

    if (alert && scoring.score >= 85) {
      const mitre = this.mapMitre({
        logType: input.logType,
        message: input.message,
      });

      incident = await createIncident({
        title: `Auto-Incident: ${input.logType}`,
        description: `Automated incident generated from high-confidence alert ${alert.id}. ${input.message}`,
        severity: normalizedSeverity,
        status: IncidentStatus.OPEN,
        source: 'AUTO_ALERT',
        assignedTo: null,
        mitreTactic: mitre?.tacticName ?? null,
        mitreTechnique: mitre?.techniqueName ?? null,
        createdBy: input.actorId ?? '00000000-0000-0000-0000-000000000000',
      });

      await bindAlertsToIncident([alert.id], incident.id);
      await createIncidentEvent({
        incidentId: incident.id,
        eventType: 'AUTO_CREATED',
        description: 'Incident auto-created from high severity alert',
        actorId: input.actorId ?? null,
        metadata: {
          alertId: alert.id,
          logId: logRecord.id,
          score: scoring.score,
        },
      });

      emitSocketEvent(SocketEvent.INCIDENT_CREATED, {
        incidentId: incident.id,
        severity: incident.severity,
        status: incident.status,
        title: incident.title,
      });

      await workerService.enqueueAISummarization({
        targetType: 'incident',
        targetId: incident.id,
        content: JSON.stringify({
          title: incident.title,
          description: incident.description,
          severity: incident.severity,
          status: incident.status,
          alert,
          log: logRecord,
        }),
      });
    }

    await threatIntelService.processLogIndicators({
      message: input.message,
      rawData: input.rawData,
    });

    await workerService.enqueueThreatClassification({
      logId: logRecord.id,
      source: input.source,
      message: input.message,
      rawData: input.rawData,
    });

    return {
      log: logRecord,
      alert,
      incident,
      severityScore: scoring.score,
      triggeredRules: scoring.rules,
    };
  }

  async ingestLogBatch(input: {
    logs: Array<{
      source: string;
      logType: string;
      severity: Severity;
      message: string;
      rawData: Record<string, unknown>;
      sourceIp?: string | null;
      destinationIp?: string | null;
      eventTimestamp?: Date;
    }>;
    actorId?: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const results = [];
    for (const log of input.logs) {
      const result = await this.ingestLog({
        ...log,
        actorId: input.actorId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      results.push(result);
    }

    return results;
  }

  async createManualIncident(input: {
    title: string;
    description: string;
    severity: Severity;
    source: string;
    assignedTo?: string | null;
    mitreTactic?: string | null;
    mitreTechnique?: string | null;
    alertIds: string[];
    createdBy: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const incident = await createIncident({
      title: input.title,
      description: input.description,
      severity: input.severity,
      status: IncidentStatus.OPEN,
      source: input.source,
      assignedTo: input.assignedTo,
      mitreTactic: input.mitreTactic,
      mitreTechnique: input.mitreTechnique,
      createdBy: input.createdBy,
    });

    await bindAlertsToIncident(input.alertIds, incident.id);

    await createIncidentEvent({
      incidentId: incident.id,
      eventType: 'CREATED',
      description: 'Incident created by SOC analyst',
      actorId: input.createdBy,
      metadata: { alertIds: input.alertIds },
    });

    emitSocketEvent(SocketEvent.INCIDENT_CREATED, {
      incidentId: incident.id,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      createdAt: incident.created_at,
    });

    await auditService.logEvent({
      userId: input.createdBy,
      action: AuditAction.INCIDENT_CREATE,
      resourceType: 'incident',
      resourceId: incident.id,
      details: {
        severity: incident.severity,
        source: incident.source,
        alertIds: input.alertIds,
      },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return incident;
  }

  async updateIncidentState(input: {
    incidentId: string;
    updates: Partial<{
      title: string;
      description: string;
      severity: Severity;
      status: IncidentStatus;
      assignedTo: string | null;
      mitreTactic: string | null;
      mitreTechnique: string | null;
    }>;
    actorId: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const updated = await updateIncident(input.incidentId, input.updates);
    if (!updated) {
      throw new NotFoundError('Incident');
    }

    await createIncidentEvent({
      incidentId: updated.id,
      eventType: 'UPDATED',
      description: 'Incident state updated',
      actorId: input.actorId,
      metadata: input.updates as unknown as Record<string, unknown>,
    });

    emitSocketEvent(SocketEvent.INCIDENT_UPDATED, {
      incidentId: updated.id,
      title: updated.title,
      severity: updated.severity,
      status: updated.status,
      updatedAt: updated.updated_at,
    });

    await auditService.logEvent({
      userId: input.actorId,
      action: AuditAction.INCIDENT_UPDATE,
      resourceType: 'incident',
      resourceId: updated.id,
      details: input.updates as unknown as Record<string, unknown>,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return updated;
  }

  async getIncidentTimeline(incidentId: string) {
    const incident = await findIncidentById(incidentId);
    if (!incident) {
      throw new NotFoundError('Incident');
    }

    const timeline = await getIncidentTimeline(incidentId);
    return { incident, timeline };
  }

  async listIncidents(page: number, limit: number) {
    return listIncidents(page, limit);
  }

  async listAlerts(page: number, limit: number) {
    return listAlerts(page, limit);
  }

  async listLogs(page: number, limit: number) {
    return listLogs(page, limit);
  }
}

export const socService = new SOCService();
