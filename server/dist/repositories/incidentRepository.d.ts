import { IncidentStatus, Severity } from '../types';
export interface IncidentRecord {
    id: string;
    title: string;
    description: string;
    severity: Severity;
    status: IncidentStatus;
    assigned_to: string | null;
    mitre_tactic: string | null;
    mitre_technique: string | null;
    source: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    resolved_at: Date | null;
}
export interface IncidentEventRecord {
    id: string;
    incident_id: string;
    event_type: string;
    description: string;
    actor_id: string | null;
    metadata: Record<string, unknown>;
    created_at: Date;
}
export declare function createIncident(entry: {
    title: string;
    description: string;
    severity: Severity;
    status?: IncidentStatus;
    assignedTo?: string | null;
    mitreTactic?: string | null;
    mitreTechnique?: string | null;
    source: string;
    createdBy: string;
}): Promise<IncidentRecord>;
export declare function updateIncident(incidentId: string, updates: Partial<{
    title: string;
    description: string;
    severity: Severity;
    status: IncidentStatus;
    assignedTo: string | null;
    mitreTactic: string | null;
    mitreTechnique: string | null;
}>): Promise<IncidentRecord | null>;
export declare function findIncidentById(incidentId: string): Promise<IncidentRecord | null>;
export declare function listIncidents(page: number, limit: number): Promise<{
    rows: IncidentRecord[];
    total: number;
}>;
export declare function createIncidentEvent(entry: {
    incidentId: string;
    eventType: string;
    description: string;
    actorId?: string | null;
    metadata?: Record<string, unknown>;
}): Promise<void>;
export declare function getIncidentTimeline(incidentId: string): Promise<IncidentEventRecord[]>;
//# sourceMappingURL=incidentRepository.d.ts.map