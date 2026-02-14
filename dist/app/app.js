"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Middleware Imports
const security_middleware_1 = require("../common/middleware/security.middleware");
// Route Imports
const auth_1 = require("../modules/auth"); // Check if this is named or default export!
const tours_1 = require("../modules/tours"); // Check if this is named or default export!
const booking_routes_1 = __importDefault(require("../modules/bookings/api/booking.routes"));
const payment_routes_1 = __importDefault(require("../modules/payments/payment.routes"));
const review_routes_1 = __importDefault(require("../modules/reviews/review.routes"));
const admin_routes_1 = __importDefault(require("../modules/admin/admin.routes"));
const upload_routes_1 = __importDefault(require("../modules/upload/upload.routes"));
const app = (0, express_1.default)();
// ==========================================
// 🚨 CRITICAL FIX FOR RENDER DEPLOYMENT 🚨
// ==========================================
// This tells Express to trust the "X-Forwarded-For" header from Render's Load Balancer.
// Without this, rate-limiting breaks and the app crashes.
app.set('trust proxy', 1);
// ==========================================
// 1. Global Basics (Must be first)
// ==========================================
app.use(express_1.default.json()); // Parse JSON bodies
app.use((0, cookie_parser_1.default)()); // Parse cookies
app.use((0, helmet_1.default)()); // Security headers
// CORS: Allow Frontend to talk to Backend
// In production, replace '*' with your actual frontend URL
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*', // Allow all or specific frontend
    credentials: true, // Allow cookies
}));
// ==========================================
// 2. Health Check (CRITICAL: Place BEFORE strict security)
// ==========================================
// Render hits this to know if the app is alive.
// It must NOT be blocked by rate limiters or origin checks.
app.get('/', (_req, res) => {
    res.status(200).json({
        message: 'DD Tours & Travels V2 API is running! 🚀',
        env: process.env.NODE_ENV, // Helpful for debugging
        timestamp: new Date().toISOString()
    });
});
// ==========================================
// 3. Strict Security (Apply only to API routes)
// ==========================================
app.use('/api', security_middleware_1.apiLimiter); // Only limit API calls, not health checks
app.use('/api', security_middleware_1.checkOrigin); // Only check origin for API calls
// ==========================================
// 4. Register Routes
// ==========================================
app.use("/api/v1/auth", auth_1.authRoutes);
app.use("/api/v1/tours", tours_1.tourRoutes);
app.use("/api/v1/bookings", booking_routes_1.default);
app.use("/api/v1/payment", payment_routes_1.default);
app.use("/api/v1/reviews", review_routes_1.default);
app.use("/api/v1/admin", admin_routes_1.default);
app.use("/api/v1/upload", upload_routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map