import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error('❌ REDIS_URL is not defined in .env file');
}

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,

    // Optional: Retry strategy if connection is lost
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    tls: redisUrl.startsWith('rediss://') ? {} : undefined,
});

redis.on('connect', () => {
    console.log('✅ Connected to Cloud Redis successfully!');
});

redis.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});

export const clearCache = async (pattern: string) => {
    // ⚠️ WARNING: In a massive production DB, use 'SCAN' instead of 'KEYS' to avoid blocking.
    // For this project, 'KEYS' is perfectly fine and fast enough.
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
        await redis.del(keys);
        console.log(`🧹 Cache cleared for pattern: ${pattern}`);
    }
};

export default redis;