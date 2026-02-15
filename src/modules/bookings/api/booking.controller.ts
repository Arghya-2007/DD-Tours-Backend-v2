import { Request, Response } from "express";
import * as bookingService from "./../core/booking.service";
import { AuthRequest } from "@common/middleware/auth.middleware"; // Ensure this path is correct

// ==========================================
// 1. CREATE BOOKING (Transaction Safe)
// ==========================================
export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId; // From JWT
        if (!userId) throw new Error("User not authenticated");

        // Pass userId and body to service (Service handles Capacity Transaction)
        const result = await bookingService.createBookingIntoDB(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Booking initiated successfully! Please proceed to payment.",
            data: result
        });
    } catch (error: any) {
        // Handle "Capacity Full" errors specifically if possible
        const status = error.message.includes("seats") ? 409 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. GET ALL BOOKINGS (Smart Filter)
// ==========================================
// Admin sees ALL. User sees ONLY THEIRS.
export const getBookings = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId || !role) throw new Error("Unauthorized");

        // Service logic decides based on role
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

// ==========================================
// 3. GET SINGLE BOOKING (Details)
// ==========================================
// 🆕 Added this: Essential for clicking into a specific booking
export const getBookingById = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!bookingId) throw new Error("Booking ID is required");

        const result = await bookingService.getBookingByIdFromDB(bookingId);

        // Security Check: Users can only see their own bookings
        if (role !== 'ADMIN' && result?.userId !== userId) {
            return res.status(403).json({ success: false, message: "Forbidden Access" });
        }

        if (!result) return res.status(404).json({ success: false, message: "Booking not found" });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. UPDATE BOOKING STATUS (Admin)
// ==========================================
// Handles Confirmations & Cancellations (Restores Seats)
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { bookingStatus } = req.body; // e.g., "CONFIRMED", "CANCELLED"

        if (!bookingId) throw new Error("Booking ID is required");
        if (!bookingStatus) throw new Error("New status is required");

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

// ==========================================
// 5. UPDATE PAYMENT STATUS (Admin)
// ==========================================
export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { paymentStatus } = req.body;

        if (!bookingId) throw new Error("Booking ID is required");
        if (!paymentStatus) throw new Error("Payment status is required");

        const result = await bookingService.updatePaymentStatusInDB(bookingId, paymentStatus);

        res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 6. DELETE BOOKING (Admin)
// ==========================================
export const deleteBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;
        if (!bookingId) throw new Error("Booking ID is required");

        await bookingService.deleteBookingFromDB(bookingId);

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
            data: null
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 7. GET INVOICE DATA (PDF Ready)
// ==========================================
// 🆕 Added this: Returns structured JSON for printing
export const getBookingInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user?.userId;

        const booking = await bookingService.getBookingByIdFromDB(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Security Check
        if (req.user?.role !== 'ADMIN' && booking.userId !== userId) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        // Structure Data for Frontend PDF Generator
        const invoiceData = {
            invoiceId: `INV-${booking.bookingId.slice(0, 8).toUpperCase()}`,
            date: new Date().toISOString(),
            customerName: booking.user?.userName || "Guest",
            customerEmail: booking.user?.userEmail,
            tourTitle: booking.tour?.tourTitle,
            guests: booking.totalGuests,
            amount: booking.totalPrice,
            status: booking.paymentStatus
        };

        res.status(200).json({
            success: true,
            data: invoiceData
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};