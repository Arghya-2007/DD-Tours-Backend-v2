import { Router } from "express";
import {createBooking, getBookings} from "./booking.controller";
import { authenticate } from "@common/middleware/auth.middleware";
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

export default router;