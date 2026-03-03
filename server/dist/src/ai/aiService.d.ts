declare class AIService {
    private readonly client;
    private sanitizeInput;
    private buildPrompt;
    private parseResponse;
    private invoke;
    summarizeIncident(context: unknown): Promise<Record<string, unknown>>;
    classifyThreat(context: unknown): Promise<Record<string, unknown>>;
    explainMalwareBehavior(context: unknown): Promise<Record<string, unknown>>;
    remediationRecommendations(context: unknown): Promise<Record<string, unknown>>;
    generateExecutiveReport(context: unknown): Promise<Record<string, unknown>>;
}
export declare const aiService: AIService;
export {};
//# sourceMappingURL=aiService.d.ts.map