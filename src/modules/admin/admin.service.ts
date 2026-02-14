import prisma from "../../app/database";
import { PaymentStatus, BookingStatus } from "@prisma/client";

export const getDashboardStats = async () => {
    // 1. Calculate Total Revenue (Sum of 'totalPrice' for COMPLETED payments)
    const revenueResult = await prisma.booking.aggregate({
        _sum: {
            totalPrice: true,
        },
        where: {
            paymentStatus: PaymentStatus.COMPLETED, // Only count real money
        },
    });

    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // 2. Count Total Bookings (Confirmed & Pending)
    const totalBookings = await prisma.booking.count();

    // 3. Count Total Users (Exclude Admins)
    const totalUsers = await prisma.user.count({
        where: { role: "USER" },
    });

    // 4. Count Active Tours
    const activeTours = await prisma.tour.count({
        where: { tourStatus: "UPCOMING" },
    });

    // 5. Get Recent 5 Bookings (For the "Recent Activity" table)
    const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { bookingDate: "desc" },
        include: {
            user: {
                select: { userName: true, userEmail: true },
            },
            tour: {
                select: { tourTitle: true },
            },
        },
    });

    return {
        totalRevenue,
        totalBookings,
        totalUsers,
        activeTours,
        recentBookings,
    };
};