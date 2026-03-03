"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socService = void 0;
const alertRepository_1 = require("../repositories/alertRepository");
const incidentRepository_1 = require("../repositories/incidentRepository");
const logRepository_1 = require("../repositories/logRepository");
const mitreAttack_1 = require("../models/mitreAttack");
const types_1 = require("../types");
const errors_1 = require("../utils/errors");
const socket_1 = require("../config/socket");
const auditService_1 = require("./auditService");
const threatIntelService_1 = require("./threatIntelService");
const workerService_1 = require("./workerService");
const severityScoreMap = {
    [types_1.Severity.INFO]: 10,
    [types_1.Severity.LOW]: 25,
    [types_1.Severity.MEDIUM]: 45,
    [types_1.Severity.HIGH]: 70,
    [types_1.Severity.CRITICAL]: 90,
};
const suspiciousRules = [
    { pattern: /failed\s+login|brute\s*force/i, score: 18, reason: 'authentication_attack_pattern' },
    { pattern: /powershell|cmd\.exe|rundll32|regsvr32/i, score: 22, reason: 'suspicious_execution' },
    { pattern: /mimikatz|lsass|credential/i, score: 25, reason: 'credential_access_indicator' },
    { pattern: /encrypt|ransom|locker/i, score: 30, reason: 'ransomware_behavior' },
    { pattern: /exfil|data\s+transfer|upload\s+large/i, score: 24, reason: 'exfiltration_pattern' },
    { pattern: /c2|beacon|reverse\s+shell/i, score: 28, reason: 'command_control_pattern' },
];
class SOCService {
    computeSeverityScore(input) {
        let score = severityScoreMap[input.severity] ?? 10;
        const rules = [];
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
    mapScoreToSeverity(score) {
        if (score >= 90)
            return types_1.Severity.CRITICAL;
        if (score >= 75)
            return types_1.Severity.HIGH;
        if (score >= 50)
            return types_1.Severity.MEDIUM;
        if (score >= 30)
            return types_1.Severity.LOW;
        return types_1.Severity.INFO;
    }
    mapMitre(input) {
        const corpus = `${input.logType} ${input.message}`.toLowerCase();
        const keywordMap = [
            { keywords: ['powershell', 'cmd', 'script'], techniqueId: 'T1059' },
            { keywords: ['mimikatz', 'credential', 'lsass'], techniqueId: 'T1003' },
            { keywords: ['ransom', 'encrypt', 'obfusc'], techniqueId: 'T1027' },
            { keywords: ['remote', 'rdp', 'smb'], techniqueId: 'T1021' },
            { keywords: ['exfil', 'upload', 'beacon'], techniqueId: 'T1048' },
        ];
        const matched = keywordMap.find(entry => entry.keywords.some(keyword => corpus.includes(keyword)));
        if (!matched)
            return null;
        return mitreAttack_1.MITRE_MAPPINGS.find(mapping => mapping.techniqueId === matched.techniqueId) ?? null;
    }
    async ingestLog(input) {
        const logRecord = await (0, logRepository_1.createLog)({
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
            alert = await (0, alertRepository_1.createAlert)({
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
            (0, socket_1.emitSocketEvent)(types_1.SocketEvent.ALERT_NEW, {
                alertId: alert.id,
                severity: alert.severity,
                title: alert.title,
                createdAt: alert.created_at,
            });
            await auditService_1.auditService.logEvent({
                userId: input.actorId ?? null,
                action: types_1.AuditAction.ALERT_CREATE,
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
            incident = await (0, incidentRepository_1.createIncident)({
                title: `Auto-Incident: ${input.logType}`,
                description: `Automated incident generated from high-confidence alert ${alert.id}. ${input.message}`,
                severity: normalizedSeverity,
                status: types_1.IncidentStatus.OPEN,
                source: 'AUTO_ALERT',
                assignedTo: null,
                mitreTactic: mitre?.tacticName ?? null,
                mitreTechnique: mitre?.techniqueName ?? null,
                createdBy: input.actorId ?? '00000000-0000-0000-0000-000000000000',
            });
            await (0, alertRepository_1.bindAlertsToIncident)([alert.id], incident.id);
            await (0, incidentRepository_1.createIncidentEvent)({
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
            (0, socket_1.emitSocketEvent)(types_1.SocketEvent.INCIDENT_CREATED, {
                incidentId: incident.id,
                severity: incident.severity,
                status: incident.status,
                title: incident.title,
            });
            await workerService_1.workerService.enqueueAISummarization({
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
        await threatIntelService_1.threatIntelService.processLogIndicators({
            message: input.message,
            rawData: input.rawData,
        });
        await workerService_1.workerService.enqueueThreatClassification({
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
    async ingestLogBatch(input) {
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
    async createManualIncident(input) {
        const incident = await (0, incidentRepository_1.createIncident)({
            title: input.title,
            description: input.description,
            severity: input.severity,
            status: types_1.IncidentStatus.OPEN,
            source: input.source,
            assignedTo: input.assignedTo,
            mitreTactic: input.mitreTactic,
            mitreTechnique: input.mitreTechnique,
            createdBy: input.createdBy,
        });
        await (0, alertRepository_1.bindAlertsToIncident)(input.alertIds, incident.id);
        await (0, incidentRepository_1.createIncidentEvent)({
            incidentId: incident.id,
            eventType: 'CREATED',
            description: 'Incident created by SOC analyst',
            actorId: input.createdBy,
            metadata: { alertIds: input.alertIds },
        });
        (0, socket_1.emitSocketEvent)(types_1.SocketEvent.INCIDENT_CREATED, {
            incidentId: incident.id,
            title: incident.title,
            severity: incident.severity,
            status: incident.status,
            createdAt: incident.created_at,
        });
        await auditService_1.auditService.logEvent({
            userId: input.createdBy,
            action: types_1.AuditAction.INCIDENT_CREATE,
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
    async updateIncidentState(input) {
        const updated = await (0, incidentRepository_1.updateIncident)(input.incidentId, input.updates);
        if (!updated) {
            throw new errors_1.NotFoundError('Incident');
        }
        await (0, incidentRepository_1.createIncidentEvent)({
            incidentId: updated.id,
            eventType: 'UPDATED',
            description: 'Incident state updated',
            actorId: input.actorId,
            metadata: input.updates,
        });
        (0, socket_1.emitSocketEvent)(types_1.SocketEvent.INCIDENT_UPDATED, {
            incidentId: updated.id,
            title: updated.title,
            severity: updated.severity,
            status: updated.status,
            updatedAt: updated.updated_at,
        });
        await auditService_1.auditService.logEvent({
            userId: input.actorId,
            action: types_1.AuditAction.INCIDENT_UPDATE,
            resourceType: 'incident',
            resourceId: updated.id,
            details: input.updates,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        });
        return updated;
    }
    async getIncidentTimeline(incidentId) {
        const incident = await (0, incidentRepository_1.findIncidentById)(incidentId);
        if (!incident) {
            throw new errors_1.NotFoundError('Incident');
        }
        const timeline = await (0, incidentRepository_1.getIncidentTimeline)(incidentId);
        return { incident, timeline };
    }
    async listIncidents(page, limit) {
        return (0, incidentRepository_1.listIncidents)(page, limit);
    }
    async listAlerts(page, limit) {
        return (0, alertRepository_1.listAlerts)(page, limit);
    }
    async listLogs(page, limit) {
        return (0, logRepository_1.listLogs)(page, limit);
    }
}
exports.socService = new SOCService();
//# sourceMappingURL=socService.js.map