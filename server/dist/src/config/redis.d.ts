import Redis from 'ioredis';
export declare const redis: Redis;
export declare const redisSubscriber: Redis;
export declare const getRedisConfig: () => {
    host: string;
    port: number;
    password: string | undefined;
    maxRetriesPerRequest: null;
};
export declare function testRedis(): Promise<boolean>;
export declare function closeRedis(): Promise<void>;
//# sourceMappingURL=redis.d.ts.map