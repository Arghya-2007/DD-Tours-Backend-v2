"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBookings = exports.createBookingIntoDB = void 0;
const database_1 = __importDefault(require("../../../app/database"));
const client_1 = require("@prisma/client");
const notification_queue_1 = require("../../../common/queue/notification.queue"); // 1. Import Queue
const emailTemplates_1 = require("../../../common/utils/emailTemplates"); // 2. Import Template
const createBookingIntoDB = async (userId, payload) => {
    // 1. Start a Transaction & Store the Result (Don't return yet!)
    const bookingResult = await database_1.default.$transaction(async (tx) => {
        // A. Check Tour Existence & Seats
        const tour = await tx.tour.findUnique({
            where: { tourId: payload.tourId }
        });
        if (!tour)
            throw new Error("Tour not found");
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
                bookingStatus: client_1.BookingStatus.PENDING,
                paymentStatus: client_1.PaymentStatus.PENDING,
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
    const user = await database_1.default.user.findUnique({ where: { userId } });
    const tour = await database_1.default.tour.findUnique({ where: { tourId: payload.tourId } });
    if (user && tour) {
        // This adds the job to Redis and returns INSTANTLY.
        // The Worker will handle the actual sending later.
        await (0, notification_queue_1.sendEmailJob)({
            email: user.userEmail,
            subject: `Booking Received - ${tour.tourTitle}`,
            html: (0, emailTemplates_1.getBookingReceivedTemplate)(user.userName, tour.tourTitle, bookingResult.bookingId)
        });
    }
    // 3. Return the Booking to the Controller
    return bookingResult;
};
exports.createBookingIntoDB = createBookingIntoDB;
const getAllBookings = async (userId, role) => {
    // logic: If Admin, show all. If User, show only theirs.
    let query = {};
    if (role !== client_1.Role.ADMIN) {
        query = { userId }; // Filter by user ID
    }
    return database_1.default.booking.findMany({
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
            user: role === client_1.Role.ADMIN ? {
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
exports.getAllBookings = getAllBookings;
//# sourceMappingURL=booking.service.js.map