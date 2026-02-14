"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookings = exports.createBooking = void 0;
const bookingService = __importStar(require("./../core/booking.service"));
const createBooking = async (req, res) => {
    try {
        const userId = req.user?.userId; // From JWT
        if (!userId)
            throw new Error("User not authenticated");
        const result = await bookingService.createBookingIntoDB(userId, req.body);
        res.status(201).json({
            success: true,
            message: "Booking initiated successfully! Please proceed to payment.",
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createBooking = createBooking;
const getBookings = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        if (!userId || !role)
            throw new Error("Unauthorized");
        const result = await bookingService.getAllBookings(userId, role);
        res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBookings = getBookings;
//# sourceMappingURL=booking.controller.js.map