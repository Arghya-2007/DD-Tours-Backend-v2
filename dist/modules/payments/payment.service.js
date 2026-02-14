"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaymentSignature = exports.createPaymentOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../../app/database"));
const client_1 = require("@prisma/client");
// Initialize Razorpay instance
// (Types are inferred automatically from the main package)
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});
// 1. Create Payment Order
const createPaymentOrder = async (bookingId) => {
    const booking = await database_1.default.booking.findUnique({
        where: { bookingId },
    });
    if (!booking)
        throw new Error("Booking not found");
    if (booking.paymentStatus === client_1.PaymentStatus.COMPLETED)
        throw new Error("Already Paid");
    // Razorpay expects amount in PAISE (Multiply by 100)
    const amount = Math.round(booking.totalPrice * 100);
    const options = {
        amount: amount,
        currency: "INR",
        receipt: bookingId, // We link our booking ID here
        payment_capture: 1, // Auto capture
    };
    // Create order
    const order = await razorpay.orders.create(options);
    // Save the transactionId (order_id) to the booking for tracking
    await database_1.default.booking.update({
        where: { bookingId },
        data: { transactionId: order.id }
    });
    return order;
};
exports.createPaymentOrder = createPaymentOrder;
// 2. Verify Payment (The Security Check)
const verifyPaymentSignature = async (payload) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
    // 🔐 Cryptographic Verification
    // Formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
    const generated_signature = crypto_1.default
        .createHmac("sha256", key_secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
    if (generated_signature === razorpay_signature) {
        // ✅ Payment Successful!
        // Find booking by order_id (stored in transactionId)
        const booking = await database_1.default.booking.findFirst({
            where: { transactionId: razorpay_order_id }
        });
        if (!booking)
            throw new Error("Booking not found for this order");
        // Update DB: Confirm Booking & Payment
        await database_1.default.booking.update({
            where: { bookingId: booking.bookingId },
            data: {
                paymentStatus: client_1.PaymentStatus.COMPLETED,
                bookingStatus: client_1.BookingStatus.CONFIRMED,
                transactionId: razorpay_payment_id // Now store the actual Payment ID
            }
        });
        return { success: true, message: "Payment Verified & Booking Confirmed" };
    }
    else {
        throw new Error("Invalid Signature! Payment Verification Failed.");
    }
};
exports.verifyPaymentSignature = verifyPaymentSignature;
//# sourceMappingURL=payment.service.js.map