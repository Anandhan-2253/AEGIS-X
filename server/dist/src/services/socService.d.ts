import { IncidentStatus, Severity } from '../types';
declare class SOCService {
    private computeSeverityScore;
    private mapScoreToSeverity;
    private mapMitre;
    ingestLog(input: {
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
    }): Promise<{
        log: import("../repositories/logRepository").SecurityLogRecord;
        alert: import("../repositories/alertRepository").AlertRecord | null;
        incident: import("../repositories/incidentRepository").IncidentRecord | null;
        severityScore: number;
        triggeredRules: string[];
    }>;
    ingestLogBatch(input: {
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
    }): Promise<{
        log: import("../repositories/logRepository").SecurityLogRecord;
        alert: import("../repositories/alertRepository").AlertRecord | null;
        incident: import("../repositories/incidentRepository").IncidentRecord | null;
        severityScore: number;
        triggeredRules: string[];
    }[]>;
    createManualIncident(input: {
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
    }): Promise<import("../repositories/incidentRepository").IncidentRecord>;
    updateIncidentState(input: {
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
    }): Promise<import("../repositories/incidentRepository").IncidentRecord>;
    getIncidentTimeline(incidentId: string): Promise<{
        incident: import("../repositories/incidentRepository").IncidentRecord;
        timeline: import("../repositories/incidentRepository").IncidentEventRecord[];
    }>;
    listIncidents(page: number, limit: number): Promise<{
        rows: import("../repositories/incidentRepository").IncidentRecord[];
        total: number;
    }>;
    listAlerts(page: number, limit: number): Promise<{
        rows: import("../repositories/alertRepository").AlertRecord[];
        total: number;
    }>;
    listLogs(page: number, limit: number): Promise<{
        rows: import("../repositories/logRepository").SecurityLogRecord[];
        total: number;
    }>;
}
export declare const socService: SOCService;
export {};
//# sourceMappingURL=socService.d.ts.map