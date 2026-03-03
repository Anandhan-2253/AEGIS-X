"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../../src/config/queue', () => ({
    addAnalysisJob: jest.fn(async (name) => ({ id: `${name}-job-id` })),
    getQueueHealth: jest.fn(async () => ({
        waiting: 3,
        active: 2,
        completed: 12,
        failed: 1,
        delayed: 0,
    })),
}));
const { workerService } = require('../../../src/services/workerService');
describe('WorkerService', () => {
    it('enqueues malware analysis jobs', async () => {
        const jobId = await workerService.enqueueMalwareAnalysis({
            reportId: 'r1',
            filePath: '/tmp/sample.bin',
            originalName: 'sample.bin',
            mimeType: 'application/octet-stream',
            uploadedBy: 'u1',
        });
        expect(jobId).toContain('malware_analysis');
    });
    it('returns queue status snapshot', async () => {
        const status = await workerService.getStatus();
        expect(status.waiting).toBe(3);
        expect(status.active).toBe(2);
        expect(status.completed).toBe(12);
        expect(status.failed).toBe(1);
    });
});
//# sourceMappingURL=workerService.test.js.map