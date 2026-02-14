import { Router } from "express";
import {
    createBooking,
    deleteBooking,
    getBookings,
    updateBookingStatus,
    updatePaymentStatus
} from "./booking.controller";
import {authenticate, requireAdmin} from "@common/middleware/auth.middleware";
import { validateRequest } from "@common/middleware/validateRequest";
import { createBookingSchema } from "./../core/booking.validation";

const router = Router();

// Only logged-in users can book
router.post(
    "/",
    authenticate,
    validateRequest(createBookingSchema),
    createBooking
);

router.get("/", authenticate, getBookings);
router.patch('/:bookingId', authenticate, requireAdmin, updateBookingStatus);

router.patch('/:bookingId/payment', authenticate, updatePaymentStatus);
router.delete('/:bookingId', authenticate, deleteBooking);

export default router;