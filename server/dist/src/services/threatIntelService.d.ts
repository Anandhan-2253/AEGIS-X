import { ThreatIntelRecord } from '../repositories/threatIntelRepository';
declare class ThreatIntelService {
    extractIOCs(payload: {
        message: string;
        rawData?: Record<string, unknown>;
    }): Array<{
        iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email';
        iocValue: string;
    }>;
    calculateRisk(iocType: string, iocValue: string): {
        confidence: number;
        riskScore: number;
        source: string;
        description: string;
    };
    processLogIndicators(payload: {
        message: string;
        rawData?: Record<string, unknown>;
    }): Promise<ThreatIntelRecord[]>;
    queryIOC(iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email', iocValue: string): Promise<ThreatIntelRecord>;
    createIntel(entry: {
        iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email';
        iocValue: string;
        threatType: string;
        confidence: number;
        source: string;
        description: string;
    }): Promise<ThreatIntelRecord>;
    listIntel(page: number, limit: number): Promise<{
        rows: ThreatIntelRecord[];
        total: number;
    }>;
    correlateEvidence(evidence: string): Promise<{
        indicators: {
            iocType: "ip" | "domain" | "hash" | "url" | "email";
            iocValue: string;
        }[];
        matches: ThreatIntelRecord[];
        aiClassification: Record<string, unknown>;
    }>;
}
export declare const threatIntelService: ThreatIntelService;
export {};
//# sourceMappingURL=threatIntelService.d.ts.map