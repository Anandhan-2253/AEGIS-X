"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerService = void 0;
const types_1 = require("../types");
const queue_1 = require("../config/queue");
class WorkerService {
    async enqueueMalwareAnalysis(payload) {
        const job = await (0, queue_1.addAnalysisJob)(types_1.JobType.MALWARE_ANALYSIS, payload);
        return job.id ?? 'unknown-job';
    }
    async enqueueThreatClassification(payload) {
        const job = await (0, queue_1.addAnalysisJob)(types_1.JobType.THREAT_CLASSIFICATION, payload);
        return job.id ?? 'unknown-job';
    }
    async enqueueAISummarization(payload) {
        const job = await (0, queue_1.addAnalysisJob)(types_1.JobType.AI_SUMMARIZATION, payload);
        return job.id ?? 'unknown-job';
    }
    async getStatus() {
        const counts = await (0, queue_1.getQueueHealth)();
        return {
            waiting: counts.waiting ?? 0,
            active: counts.active ?? 0,
            completed: counts.completed ?? 0,
            failed: counts.failed ?? 0,
            delayed: counts.delayed ?? 0,
        };
    }
}
exports.workerService = new WorkerService();
//# sourceMappingURL=workerService.js.map