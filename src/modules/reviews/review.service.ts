import prisma from "../../app/database";
import {BookingStatus, PaymentStatus} from "@prisma/client"; // Import Enums

export const createReviewIntoDB = async (userId: string, payload: any) => {
    const { tourId, rating, reviewText, photoUrl } = payload;

    // 1. VERIFY: Check if the user has a valid booking
    const booking = await prisma.booking.findFirst({
        where: {
            userId,
            tourId,
            // ⚠️ FIX: Strictly use the Enums from your schema
            OR: [
                { bookingStatus: BookingStatus.CONFIRMED },
                { paymentStatus: PaymentStatus.COMPLETED }
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
    return prisma.review.create({
        data: {
            userId,
            tourName: booking.tour.tourTitle,
            rating,
            reviewText,
            photoUrl: photoUrl || null
        }
    });
};

// ... keep getAllReviews as is
export const getAllReviews = async () => {
    return prisma.review.findMany({
        include: {
            user: {
                select: {userName: true}
            }
        },
        orderBy: {createdAt: 'desc'}
    });
};

// Delete Review
export const deleteReviewFromDB = async (reviewId: string) => {
    return prisma.review.delete({
        where: { reviewId }
    });
};