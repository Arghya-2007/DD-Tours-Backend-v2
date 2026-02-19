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
                    slug: true,
                    tourStatus: true,
                    images: true
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

        // 2. Logic: If Cancelling or Failing, RESTORE seats
        // Make sure we don't restore seats if it was already cancelled or failed
        const isCurrentlyActive = existingBooking.bookingStatus !== BookingStatus.CANCELLED && existingBooking.bookingStatus !== BookingStatus.FAILED;
        const isMovingToInactive = targetStatus === BookingStatus.CANCELLED || targetStatus === BookingStatus.FAILED;

        if (isMovingToInactive && isCurrentlyActive) {
            await tx.tour.update({
                where: { tourId: existingBooking.tourId },
                data: {
                    availableSeats: { increment: existingBooking.totalGuests }
                }
            });
        }

        // 3. Logic: If Re-Confirming a Cancelled/Failed booking, DECREASE seats again
        const isCurrentlyInactive = existingBooking.bookingStatus === BookingStatus.CANCELLED || existingBooking.bookingStatus === BookingStatus.FAILED;
        const isMovingToActive = targetStatus === BookingStatus.CONFIRMED || targetStatus === BookingStatus.PENDING;

        if (isMovingToActive && isCurrentlyInactive) {
            const tour = await tx.tour.findUnique({ where: { tourId: existingBooking.tourId }});

            if(!tour || tour.availableSeats < existingBooking.totalGuests) {
                throw new Error(`Cannot re-confirm: Only ${tour?.availableSeats || 0} seats available!`);
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
// 5. UPDATE PAYMENT STATUS (Smart Sync)
// ==========================================
export const updatePaymentStatusInDB = async (bookingId: string, status: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Get current booking
        const existingBooking = await tx.booking.findUnique({
            where: { bookingId }
        });

        if (!existingBooking) throw new Error("Booking not found");

        const targetPaymentStatus = status as PaymentStatus;
        let targetBookingStatus = existingBooking.bookingStatus;
        let seatsToRestore = 0;

        // 2. Logic: If payment FAILED or REFUNDED
        // We auto-fail/cancel the booking and flag the seats to be restored
        if (targetPaymentStatus === PaymentStatus.FAILED || targetPaymentStatus === PaymentStatus.REFUNDED) {
            const isCurrentlyActive =
                existingBooking.bookingStatus !== BookingStatus.CANCELLED &&
                existingBooking.bookingStatus !== BookingStatus.FAILED;

            if (isCurrentlyActive) {
                // If it's a refund, mark as CANCELLED. If it's a failed payment, mark as FAILED.
                targetBookingStatus = targetPaymentStatus === PaymentStatus.FAILED
                    ? BookingStatus.FAILED
                    : BookingStatus.CANCELLED;

                seatsToRestore = existingBooking.totalGuests;
            }
        }

        // 3. Logic: If payment COMPLETED
        // We auto-confirm the booking if it was still pending
        if (targetPaymentStatus === PaymentStatus.COMPLETED && existingBooking.bookingStatus === BookingStatus.PENDING) {
            targetBookingStatus = BookingStatus.CONFIRMED;
        }

        // 4. Execute Tour Capacity Update (if seats need restoring)
        if (seatsToRestore > 0) {
            await tx.tour.update({
                where: { tourId: existingBooking.tourId },
                data: {
                    availableSeats: { increment: seatsToRestore }
                }
            });
        }

        // 5. Update the Booking with BOTH new statuses
        return await tx.booking.update({
            where: { bookingId },
            data: {
                paymentStatus: targetPaymentStatus,
                bookingStatus: targetBookingStatus
            }
        });
    });
};

// ==========================================
// 6. DELETE BOOKING (Hard Delete + Capacity Logic)
// ==========================================
export const deleteBookingFromDB = async (bookingId: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Find the booking before we destroy it so we know how many seats to restore
        const booking = await tx.booking.findUnique({
            where: { bookingId }
        });

        if (!booking) throw new Error("Booking not found");

        // 2. Delete the booking
        const deletedBooking = await tx.booking.delete({
            where: { bookingId }
        });

        // 3. RESTORE SEATS: Only restore if the booking was active (Pending/Confirmed)
        // If it was already cancelled, the seats were already restored in step 4 above!
        if (booking.bookingStatus !== BookingStatus.CANCELLED && booking.bookingStatus !== BookingStatus.FAILED) {
            await tx.tour.update({
                where: { tourId: booking.tourId },
                data: {
                    availableSeats: { increment: booking.totalGuests }
                }
            });
        }

        return deletedBooking;
    });
};