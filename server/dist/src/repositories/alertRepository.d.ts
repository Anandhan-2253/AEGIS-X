import { Severity } from '../types';
export interface AlertRecord {
    id: string;
    title: string;
    description: string;
    severity: Severity;
    source_ip: string | null;
    destination_ip: string | null;
    rule_triggered: string;
    raw_log: Record<string, unknown>;
    incident_id: string | null;
    acknowledged: boolean;
    created_at: Date;
}
export declare function createAlert(entry: {
    title: string;
    description: string;
    severity: Severity;
    sourceIp?: string | null;
    destinationIp?: string | null;
    ruleTriggered: string;
    rawLog: Record<string, unknown>;
    incidentId?: string | null;
}): Promise<AlertRecord>;
export declare function listAlerts(page: number, limit: number): Promise<{
    rows: AlertRecord[];
    total: number;
}>;
export declare function bindAlertsToIncident(alertIds: string[], incidentId: string): Promise<void>;
//# sourceMappingURL=alertRepository.d.ts.map