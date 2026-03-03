import { testDatabase } from '../config/database';
import { testRedis } from '../config/redis';
import { workerService } from './workerService';

class HealthService {
  async getSystemHealth() {
    const [database, redis, queue] = await Promise.all([
      testDatabase(),
      testRedis(),
      workerService.getStatus(),
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

export const healthService = new HealthService();
