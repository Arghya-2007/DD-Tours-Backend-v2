import { Router } from "express";
import {
    createBooking,
    deleteBooking,
    getBookings,
    getBookingById,       // 👈 NEW: Import this
    getBookingInvoice,    // 👈 NEW: Import this
    updateBookingStatus,
    updatePaymentStatus
} from "./booking.controller";
import { authenticate, requireAdmin } from "@common/middleware/auth.middleware";
import { validateRequest } from "@common/middleware/validateRequest";
import { createBookingSchema } from "./../core/booking.validation";

const router = Router();

// ==========================================
// 🔓 USER ROUTES (Authenticated)
// ==========================================

// 1. Create Booking
router.post(
    "/",
    authenticate,
    validateRequest(createBookingSchema),
    createBooking
);

// 2. Get All My Bookings (or All if Admin)
router.get("/", authenticate, getBookings);

// 3. Get Single Booking Details ( 👇 NEW ROUTE )
router.get("/:bookingId", authenticate, getBookingById);

// 4. Get Booking Invoice ( 👇 NEW ROUTE )
router.get("/:bookingId/invoice", authenticate, getBookingInvoice);


// ==========================================
// 🔒 ADMIN ROUTES (Protected)
// ==========================================

// 5. Update Booking Status (Confirm/Cancel)
router.patch(
    '/:bookingId',
    authenticate,
    requireAdmin, // 👈 CRITICAL SECURITY
    updateBookingStatus
);

// 6. Update Payment Status (Mark Paid)
// ⚠️ Fixed URL to match Frontend: '/payment-status'
router.patch(
    '/:bookingId/payment-status',
    authenticate,
    requireAdmin, // 👈 CRITICAL SECURITY
    updatePaymentStatus
);

// 7. Delete Booking
router.delete(
    '/:bookingId',
    authenticate,
    requireAdmin, // 👈 CRITICAL SECURITY
    deleteBooking
);

export default router;