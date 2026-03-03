import { Job, Queue, QueueEvents } from 'bullmq';
import { JobType } from '../types';
export declare const analysisQueue: Queue<any, any, string, any, any, string> | null;
export declare const analysisQueueEvents: QueueEvents | null;
export declare function addAnalysisJob<T>(name: JobType, payload: T): Promise<Job<T>>;
export declare function getQueueHealth(): Promise<{
    [index: string]: number;
}>;
export declare function closeQueue(): Promise<void>;
//# sourceMappingURL=queue.d.ts.map