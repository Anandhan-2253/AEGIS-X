export interface IPReputationEntry {
    score: number;
    category: 'benign' | 'suspicious' | 'malicious';
    provider: string;
}
export declare const MOCK_IP_REPUTATION_DB: Record<string, IPReputationEntry>;
//# sourceMappingURL=ipReputation.d.ts.map