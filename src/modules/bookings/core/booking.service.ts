import prisma from "../../../app/database";
import {BookingStatus, PaymentStatus, Role} from "@prisma/client";
import {sendEmailJob} from "@common/queue/notification.queue"; // 1. Import Queue
import {getBookingReceivedTemplate} from "@common/utils/emailTemplates"; // 2. Import Template

export const createBookingIntoDB = async (userId: string, payload: any) => {
    // 1. Start a Transaction & Store the Result (Don't return yet!)
    const bookingResult = await prisma.$transaction(async (tx) => {

        // A. Check Tour Existence & Seats
        const tour = await tx.tour.findUnique({
            where: { tourId: payload.tourId }
        });

        if (!tour) throw new Error("Tour not found");

        if (tour.tourStatus !== "UPCOMING") {
            throw new Error("This tour is not available for booking");
        }

        const requestedSeats = payload.guestDetails.length;

        if (tour.availableSeats < requestedSeats) {
            throw new Error(`Not enough seats available. Only ${tour.availableSeats} left.`);
        }

        // B. Calculate Price
        const totalPrice = tour.tourPrice * requestedSeats;

        // C. Create the Booking (Pending Payment)
        const booking = await tx.booking.create({
            data: {
                userId,
                tourId: payload.tourId,
                totalGuests: requestedSeats,
                totalPrice,
                guestDetails: payload.guestDetails,
                bookingStatus: BookingStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
                paymentMethod: payload.paymentMethod || "UNKNOWN"
            }
        });

        // D. ⚠️ ATOMIC UPDATE: Decrease Seats
        await tx.tour.update({
            where: { tourId: payload.tourId },
            data: {
                availableSeats: {
                    decrement: requestedSeats // Magic: Atomic decrement
                }
            }
        });

        return booking; // This value is stored in 'bookingResult'
    });

    // 2. ⚡️ ADD EMAIL TO QUEUE (Run after transaction works)
    // We need to fetch User and Tour details to personalize the email
    const user = await prisma.user.findUnique({ where: { userId } });
    const tour = await prisma.tour.findUnique({ where: { tourId: payload.tourId } });

    if (user && tour) {
        // This adds the job to Redis and returns INSTANTLY.
        // The Worker will handle the actual sending later.
        await sendEmailJob({
            email: user.userEmail,
            subject: `Booking Received - ${tour.tourTitle}`,
            html: getBookingReceivedTemplate(user.userName, tour.tourTitle, bookingResult.bookingId)
        });
    }

    // 3. Return the Booking to the Controller
    return bookingResult;
};

export const getAllBookings = async (userId: string, role: string) => {
    // logic: If Admin, show all. If User, show only theirs.
    let query: any = {};

    if (role !== Role.ADMIN) {
        query = { userId }; // Filter by user ID
    }

    return prisma.booking.findMany({
        where: query,
        include: {
            tour: {
                select: {
                    tourTitle: true,
                    tourDuration: true,
                    tourPrice: true,
                    images: true
                }
            },
            // If Admin, show who booked it. If User, we don't need this.
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

// ... inside your booking.service.ts

export const updateBookingStatusInDB = async (bookingId: string, status: string) => {
    // Assuming you use Prisma
    return prisma.booking.update({
        where: {bookingId},
        data: {bookingStatus: status as any} // Cast if using strict Enums
    });
};

// ... imports

// 1. Update Payment
export const updatePaymentStatusInDB = async (bookingId: string, status: string) => {
    return prisma.booking.update({
        where: {bookingId},
        data: {paymentStatus: status as any}
    });
};

// 2. Delete Booking
export const deleteBookingFromDB = async (bookingId: string) => {
    return prisma.booking.delete({
        where: {bookingId}
    });
};