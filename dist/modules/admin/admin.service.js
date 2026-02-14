"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const database_1 = __importDefault(require("../../app/database"));
const client_1 = require("@prisma/client");
const getDashboardStats = async () => {
    // 1. Calculate Total Revenue (Sum of 'totalPrice' for COMPLETED payments)
    const revenueResult = await database_1.default.booking.aggregate({
        _sum: {
            totalPrice: true,
        },
        where: {
            paymentStatus: client_1.PaymentStatus.COMPLETED, // Only count real money
        },
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;
    // 2. Count Total Bookings (Confirmed & Pending)
    const totalBookings = await database_1.default.booking.count();
    // 3. Count Total Users (Exclude Admins)
    const totalUsers = await database_1.default.user.count({
        where: { role: "USER" },
    });
    // 4. Count Active Tours
    const activeTours = await database_1.default.tour.count({
        where: { tourStatus: "UPCOMING" },
    });
    // 5. Get Recent 5 Bookings (For the "Recent Activity" table)
    const recentBookings = await database_1.default.booking.findMany({
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
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=admin.service.js.map