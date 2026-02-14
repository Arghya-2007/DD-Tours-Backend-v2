import nodemailer from "nodemailer";

// 1. Create the Transporter (The Postman)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 2. Define the Email Options Interface
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

// 3. The Send Function
export const sendEmail = async (options: EmailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: `"DD Tours & Travels" <${process.env.EMAIL_USER}>`, // Sender address
            to: options.to, // Receiver
            subject: options.subject, // Subject line
            html: options.html, // HTML body
        });

        console.log("📧 Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        // Don't throw error here, or it might rollback the booking transaction!
        // Just log it.
    }
};