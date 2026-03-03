"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthService = void 0;
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
const workerService_1 = require("./workerService");
class HealthService {
    async getSystemHealth() {
        const [database, redis, queue] = await Promise.all([
            (0, database_1.testDatabase)(),
            (0, redis_1.testRedis)(),
            workerService_1.workerService.getStatus(),
        ]);
        const healthy = database && redis;
        return {
            status: healthy ? 'healthy' : 'degraded',
            checks: {
                database,
                redis,
                queue,
            },
            timestamp: new Date().toISOString(),
        };
    }
}
exports.healthService = new HealthService();
//# sourceMappingURL=healthService.js.map