"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        tourId: zod_1.z.string().uuid("Invalid Tour ID"),
        // Guest details are flexible but must be an array
        guestDetails: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string().min(1),
            age: zod_1.z.number().int().min(1),
            gender: zod_1.z.enum(["Male", "Female", "Other"])
        })).min(1, "At least 1 guest is required"),
        // Payment Method
        paymentMethod: zod_1.z.enum(["CREDIT_CARD", "UPI", "NET_BANKING", "OFFLINE"]),
        // Optional: Coupon Code
        couponCode: zod_1.z.string().optional()
    })
});
//# sourceMappingURL=booking.validation.js.map