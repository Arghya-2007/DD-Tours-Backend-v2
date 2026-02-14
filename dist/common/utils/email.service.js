"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// 1. Create the Transporter (The Postman)
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// 3. The Send Function
const sendEmail = async (options) => {
    try {
        const info = await transporter.sendMail({
            from: `"DD Tours & Travels" <${process.env.EMAIL_USER}>`, // Sender address
            to: options.to, // Receiver
            subject: options.subject, // Subject line
            html: options.html, // HTML body
        });
        console.log("📧 Email sent: %s", info.messageId);
        return info;
    }
    catch (error) {
        console.error("❌ Error sending email:", error);
        // Don't throw error here, or it might rollback the booking transaction!
        // Just log it.
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.service.js.map