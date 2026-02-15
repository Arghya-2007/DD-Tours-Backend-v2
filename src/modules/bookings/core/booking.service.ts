import prisma from "../../../app/database";
import { BookingStatus, PaymentStatus, Role } from "@prisma/client";
import { sendEmailJob } from "@common/queue/notification.queue";
import { getBookingReceivedTemplate } from "@common/utils/emailTemplates";

// ==========================================
// 1. CREATE BOOKING (Transaction + Email Queue)
// ==========================================
export const createBookingIntoDB = async (userId: string, payload: any) => {
    // 1. Start a Transaction
    const bookingResult = await prisma.$transaction(async (tx) => {

        // A. Check Tour Existence
        const tour = await tx.tour.findUnique({
            where: { tourId: payload.tourId }
        });

        if (!tour) throw new Error("Tour not found");

        if (tour.tourStatus !== "UPCOMING") {
            throw new Error("This tour is not available for booking");
        }

        // B. Check Seat Availability
        // Note: Payload usually has guestDetails array. Length = count.
        const requestedSeats = payload.guestDetails?.length || payload.totalGuests || 1;

        if (tour.availableSeats < requestedSeats) {
            throw new Error(`Not enough seats available. Only ${tour.availableSeats} left.`);
        }

        // C. Calculate Price (Server-side calculation is safer)
        const totalPrice = tour.tourPrice * requestedSeats;

        // D. Create the Booking
        const booking = await tx.booking.create({
            data: {
                userId,
                tourId: payload.tourId,
                totalGuests: requestedSeats,
                totalPrice,
                guestDetails: payload.guestDetails || [],
                bookingStatus: BookingStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
                paymentMethod: payload.paymentMethod || "UNKNOWN"
            }
        });

        // E. ⚠️ ATOMIC UPDATE: Decrease Seats
        await tx.tour.update({
            where: { tourId: payload.tourId },
            data: {
                availableSeats: {
                    decrement: requestedSeats
                }
            }
        });

        return booking;
    });

    // 2. ⚡️ ADD EMAIL TO QUEUE (Run after transaction works)
    // We fetch user/tour again outside tx for clean email data
    const user = await prisma.user.findUnique({ where: { userId } });
    const tourInfo = await prisma.tour.findUnique({ where: { tourId: payload.tourId } });

    if (user && tourInfo) {
        await sendEmailJob({
            email: user.userEmail,
            subject: `Booking Received - ${tourInfo.tourTitle}`,
            html: getBookingReceivedTemplate(user.userName, tourInfo.tourTitle, bookingResult.bookingId)
        });
    }

    return bookingResult;
};

// ==========================================
// 2. GET ALL BOOKINGS (Smart Filter)
// ==========================================
export const getAllBookings = async (userId: string, role: string) => {
    // If Admin, show all. If User, show only theirs.
    const query: any = role === Role.ADMIN ? {} : { userId };

    return prisma.booking.findMany({
        where: query,
        include: {
            tour: {
                select: {
                    tourTitle: true,
                    tourDuration: true,
                    tourPrice: true,
                    // images: true // Uncomment if needed
                }
            },
            // Include User details for Admin only
            user: role === Role.ADMIN ? {
                select: {
                    userName: true,
                    userEmail: true,
                    phoneNumber: true
                }
            } : false
        },
        orderBy: {
            bookingDate: 'desc' // Newest first
        }
    });
};

// ==========================================
// 3. GET SINGLE BOOKING (Details/Invoice)
// ==========================================
// 🆕 Essential for Invoice generation and detailed view
export const getBookingByIdFromDB = async (bookingId: string) => {
    return prisma.booking.findUnique({
        where: {bookingId},
        include: {
            user: {
                select: {
                    userName: true,
                    userEmail: true,
                    phoneNumber: true,
                    aadharNumber: true
                }
            },
            tour: {
                select: {
                    tourTitle: true,
                    tourPrice: true,
                    tourDuration: true
                }
            }
        }
    });
};

// ==========================================
// 4. UPDATE BOOKING STATUS (With Capacity Logic)
// ==========================================
export const updateBookingStatusInDB = async (bookingId: string, status: string) => {
    // 🚨 Using Transaction to handle seat restoration logic safely
    return await prisma.$transaction(async (tx) => {

        // 1. Get current booking
        const existingBooking = await tx.booking.findUnique({
            where: { bookingId }
        });

        if (!existingBooking) throw new Error("Booking not found");

        const targetStatus = status as BookingStatus;

        // 2. Logic: If Cancelling, RESTORE seats
        if (targetStatus === BookingStatus.CANCELLED && existingBooking.bookingStatus !== BookingStatus.CANCELLED) {
            await tx.tour.update({
                where: { tourId: existingBooking.tourId },
                data: {
                    availableSeats: { increment: existingBooking.totalGuests }
                }
            });
        }

        // 3. Logic: If Re-Confirming a Cancelled booking, DECREASE seats again
        if (targetStatus === BookingStatus.CONFIRMED && existingBooking.bookingStatus === BookingStatus.CANCELLED) {
            const tour = await tx.tour.findUnique({ where: { tourId: existingBooking.tourId }});

            if(!tour || tour.availableSeats < existingBooking.totalGuests) {
                throw new Error("Cannot re-confirm: Not enough seats available!");
            }

            await tx.tour.update({
                where: { tourId: existingBooking.tourId },
                data: { availableSeats: { decrement: existingBooking.totalGuests } }
            });
        }

        // 4. Update the Booking
        return await tx.booking.update({
            where: { bookingId },
            data: { bookingStatus: targetStatus }
        });
    });
};

// ==========================================
// 5. UPDATE PAYMENT STATUS
// ==========================================
export const updatePaymentStatusInDB = async (bookingId: string, status: string) => {
    return prisma.booking.update({
        where: { bookingId },
        data: { paymentStatus: status as PaymentStatus }
    });
};

// ==========================================
// 6. DELETE BOOKING (Hard Delete)
// ==========================================
export const deleteBookingFromDB = async (bookingId: string) => {
    return prisma.booking.delete({
        where: { bookingId }
    });
};