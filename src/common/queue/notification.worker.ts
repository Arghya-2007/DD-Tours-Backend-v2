import { Worker } from "bullmq";
import redis from "../../app/redis";
import { sendEmail } from "../utils/email.service"; // The nodemailer function we wrote earlier

const worker = new Worker(
    "email-queue", // Must match the queue name
    async (job) => {
        console.log(`Processing job ${job.id}: Sending email to ${job.data.email}`);

        // Call the actual email service
        await sendEmail({
            to: job.data.email,
            subject: job.data.subject,
            html: job.data.html,
        });

        console.log(`Job ${job.id} completed!`);
    },
    {
        connection: redis as any, // Reuse connection
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
});

export default worker;