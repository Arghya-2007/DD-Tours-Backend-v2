import { z } from 'zod';

export const createBookingSchema = z.object({
    body: z.object({
        tourId: z.string().uuid("Invalid Tour ID"),
        // Guest details are flexible but must be an array
        guestDetails: z.array(
            z.object({
                name: z.string().min(1),
                age: z.number().int().min(1),
                gender: z.enum(["Male", "Female", "Other"])
            })
        ).min(1, "At least 1 guest is required"),

        // Payment Method
        paymentMethod: z.enum(["CREDIT_CARD", "UPI", "NET_BANKING", "OFFLINE"]),

        // Optional: Coupon Code
        couponCode: z.string().optional()
    })
});