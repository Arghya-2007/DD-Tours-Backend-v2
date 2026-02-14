"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error('❌ REDIS_URL is not defined in .env file');
}
const redis = new ioredis_1.default(redisUrl, {
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
const clearCache = async (pattern) => {
    // ⚠️ WARNING: In a massive production DB, use 'SCAN' instead of 'KEYS' to avoid blocking.
    // For this project, 'KEYS' is perfectly fine and fast enough.
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
        await redis.del(keys);
        console.log(`🧹 Cache cleared for pattern: ${pattern}`);
    }
};
exports.clearCache = clearCache;
exports.default = redis;
//# sourceMappingURL=redis.js.map