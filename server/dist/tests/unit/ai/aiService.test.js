"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aiService_1 = require("../../../src/ai/aiService");
describe('AIService', () => {
    const mockPost = jest.fn();
    beforeEach(() => {
        mockPost.mockReset();
        aiService_1.aiService.client = { post: mockPost };
    });
    it('parses structured JSON response', async () => {
        mockPost.mockResolvedValue({
            data: {
                response: '{"summary":"incident summary","key_findings":["x"]}',
            },
        });
        const result = await aiService_1.aiService.summarizeIncident({ message: 'possible malware' });
        expect(result.summary).toBe('incident summary');
    });
    it('falls back to raw summary when JSON parsing fails', async () => {
        mockPost.mockResolvedValue({
            data: {
                response: 'non json model output',
            },
        });
        const result = await aiService_1.aiService.summarizeIncident({ message: 'raw output' });
        expect(result.summary).toBe('non json model output');
    });
});
//# sourceMappingURL=aiService.test.js.map