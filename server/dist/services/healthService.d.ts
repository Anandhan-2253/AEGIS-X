declare class HealthService {
    getSystemHealth(): Promise<{
        status: string;
        checks: {
            database: boolean;
            redis: boolean;
            queue: import("../types").QueueHealth;
        };
        timestamp: string;
    }>;
}
export declare const healthService: HealthService;
export {};
//# sourceMappingURL=healthService.d.ts.map