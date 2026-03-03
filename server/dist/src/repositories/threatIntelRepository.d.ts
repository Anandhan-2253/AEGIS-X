export interface ThreatIntelRecord {
    id: string;
    ioc_type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
    ioc_value: string;
    threat_type: string;
    confidence: number;
    risk_score: number;
    source: string;
    description: string;
    first_seen: Date;
    last_seen: Date;
    active: boolean;
    created_at: Date;
}
export declare function upsertThreatIntel(entry: {
    iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email';
    iocValue: string;
    threatType: string;
    confidence: number;
    riskScore: number;
    source: string;
    description: string;
}): Promise<ThreatIntelRecord>;
export declare function findThreatIntel(iocType: string, iocValue: string): Promise<ThreatIntelRecord | null>;
export declare function listThreatIntel(page: number, limit: number): Promise<{
    rows: ThreatIntelRecord[];
    total: number;
}>;
//# sourceMappingURL=threatIntelRepository.d.ts.map