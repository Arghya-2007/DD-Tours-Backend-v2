import { Request, Response } from "express";
import * as bookingService from "./../core/booking.service";
import { AuthRequest } from "@common/middleware/auth.middleware"; // Custom Interface

export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId; // From JWT
        if (!userId) throw new Error("User not authenticated");

        const result = await bookingService.createBookingIntoDB(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Booking initiated successfully! Please proceed to payment.",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId || !role) throw new Error("Unauthorized");

        const result = await bookingService.getAllBookings(userId, role);

        res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { bookingStatus } = req.body; // e.g., "CONFIRMED", "CANCELLED"

        if (!bookingId) throw new Error("Booking ID is required");
        if (!bookingStatus) throw new Error("New status is required");

        // call service (we'll check this next)
        const result = await bookingService.updateBookingStatusInDB(bookingId, bookingStatus);

        res.status(200).json({
            success: true,
            message: `Booking status updated to ${bookingStatus}`,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};