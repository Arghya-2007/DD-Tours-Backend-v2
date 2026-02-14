"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../../app/redis"));
const email_service_1 = require("../utils/email.service"); // The nodemailer function we wrote earlier
const worker = new bullmq_1.Worker("email-queue", // Must match the queue name
async (job) => {
    console.log(`Processing job ${job.id}: Sending email to ${job.data.email}`);
    // Call the actual email service
    await (0, email_service_1.sendEmail)({
        to: job.data.email,
        subject: job.data.subject,
        html: job.data.html,
    });
    console.log(`Job ${job.id} completed!`);
}, {
    connection: redis_1.default, // Reuse connection
});
worker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed!`);
});
worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
});
exports.default = worker;
//# sourceMappingURL=notification.worker.js.map