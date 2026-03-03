import { MalwareAnalysisJobData, ThreatClassificationJobData, QueueHealth } from '../types';
declare class WorkerService {
    enqueueMalwareAnalysis(payload: MalwareAnalysisJobData): Promise<string>;
    enqueueThreatClassification(payload: ThreatClassificationJobData): Promise<string>;
    enqueueAISummarization(payload: {
        targetType: 'incident' | 'malware' | 'threat';
        targetId: string;
        content: string;
    }): Promise<string>;
    getStatus(): Promise<QueueHealth>;
}
export declare const workerService: WorkerService;
export {};
//# sourceMappingURL=workerService.d.ts.map