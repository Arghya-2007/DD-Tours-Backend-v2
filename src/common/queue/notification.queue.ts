import { Queue } from "bullmq";
import redis from "../../app/redis"; // Your existing Redis connection

// 1. Create the Queue
// We reuse the existing Redis connection logic but BullMQ needs connection options
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined
};

// If you are using the ioredis instance directly, BullMQ supports that too,
// but usually it prefers a connection config object.
// Let's use the URL string from .env for simplicity if available.

export const emailQueue = new Queue("email-queue", {
    connection: redis as any // We can pass the existing ioredis instance directly!
});

// 2. Helper to Add Jobs
interface EmailJobData {
    email: string;
    subject: string;
    html: string;
}

export const sendEmailJob = async (data: EmailJobData) => {
    await emailQueue.add("send-email", data, {
        attempts: 3, // Retry 3 times if it fails
        backoff: {
            type: "exponential",
            delay: 1000, // Wait 1s, then 2s, then 4s...
        },
        removeOnComplete: true, // Auto-delete job after success
    });
    console.log(`Job added to queue: Send email to ${data.email}`);
};