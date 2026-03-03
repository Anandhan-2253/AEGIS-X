"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisConfig = exports.redisSubscriber = exports.redis = void 0;
exports.testRedis = testRedis;
exports.closeRedis = closeRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
const logger_1 = require("./logger");
const isTest = env_1.env.NODE_ENV === 'test';
const redisConfig = {
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
    password: env_1.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
};
const redisStub = {
    ping: async () => 'PONG',
    quit: async () => undefined,
    on: () => undefined,
};
exports.redis = isTest ? redisStub : new ioredis_1.default(redisConfig);
exports.redisSubscriber = isTest ? redisStub : new ioredis_1.default(redisConfig);
if (!isTest) {
    exports.redis.on('connect', () => logger_1.logger.info('Redis connected'));
    exports.redis.on('error', (error) => logger_1.logger.error('Redis error', { error: error.message }));
}
const getRedisConfig = () => ({ ...redisConfig });
exports.getRedisConfig = getRedisConfig;
async function testRedis() {
    try {
        const pong = await exports.redis.ping();
        return pong === 'PONG';
    }
    catch {
        return false;
    }
}
async function closeRedis() {
    await Promise.all([exports.redis.quit(), exports.redisSubscriber.quit()]);
}
//# sourceMappingURL=redis.js.map