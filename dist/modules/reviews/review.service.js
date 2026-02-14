"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReviews = exports.createReviewIntoDB = void 0;
const database_1 = __importDefault(require("../../app/database"));
const client_1 = require("@prisma/client"); // Import Enums
const createReviewIntoDB = async (userId, payload) => {
    const { tourId, rating, reviewText, photoUrl } = payload;
    // 1. VERIFY: Check if the user has a valid booking
    const booking = await database_1.default.booking.findFirst({
        where: {
            userId,
            tourId,
            // ⚠️ FIX: Strictly use the Enums from your schema
            OR: [
                { bookingStatus: client_1.BookingStatus.CONFIRMED },
                { paymentStatus: client_1.PaymentStatus.COMPLETED }
            ]
        },
        include: {
            tour: true // We need the tour details for the snapshot
        }
    });
    if (!booking) {
        throw new Error("You can only review tours you have booked and confirmed!");
    }
    // 2. SNAPSHOT: Create the Review with the Tour Name
    // Note: We use 'booking.tour.tourTitle' because we included the tour above
    return database_1.default.review.create({
        data: {
            userId,
            tourName: booking.tour.tourTitle,
            rating,
            reviewText,
            photoUrl: photoUrl || null
        }
    });
};
exports.createReviewIntoDB = createReviewIntoDB;
// ... keep getAllReviews as is
const getAllReviews = async () => {
    return database_1.default.review.findMany({
        include: {
            user: {
                select: { userName: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getAllReviews = getAllReviews;
//# sourceMappingURL=review.service.js.map