import { Severity } from '../types';
export interface SecurityLogRecord {
    id: string;
    source: string;
    log_type: string;
    severity: Severity;
    message: string;
    raw_data: Record<string, unknown>;
    source_ip: string | null;
    destination_ip: string | null;
    event_timestamp: Date;
    ingested_at: Date;
}
export declare function createLog(entry: {
    source: string;
    logType: string;
    severity: Severity;
    message: string;
    rawData: Record<string, unknown>;
    sourceIp?: string | null;
    destinationIp?: string | null;
    eventTimestamp?: Date;
}): Promise<SecurityLogRecord>;
export declare function listLogs(page: number, limit: number): Promise<{
    rows: SecurityLogRecord[];
    total: number;
}>;
//# sourceMappingURL=logRepository.d.ts.map