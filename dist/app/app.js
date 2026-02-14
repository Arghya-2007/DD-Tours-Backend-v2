"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = require("../modules/auth");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const security_middleware_1 = require("../common/middleware/security.middleware");
const tours_1 = require("../modules/tours");
const booking_routes_1 = __importDefault(require("../modules/bookings/api/booking.routes"));
const payment_routes_1 = __importDefault(require("../modules/payments/payment.routes"));
const review_routes_1 = __importDefault(require("../modules/reviews/review.routes"));
const admin_routes_1 = __importDefault(require("../modules/admin/admin.routes"));
const upload_routes_1 = __importDefault(require("../modules/upload/upload.routes"));
const app = (0, express_1.default)();
// 1. Global Middleware
app.use((0, cors_1.default)()); // Allow requests from frontend
app.use((0, helmet_1.default)()); // Security headers
app.use(express_1.default.json()); // Parse JSON bodies
app.use((0, cookie_parser_1.default)()); // add cookies
app.use('/api', security_middleware_1.apiLimiter);
app.use(security_middleware_1.checkOrigin);
// 2. Health Check Route (Good for testing)
app.get('/', (_req, res) => {
    res.status(200).json({
        message: 'DD Tours & Travels V2 API is running! 🚀',
        timestamp: new Date().toISOString()
    });
});
// 3. Register Module Routes (We will add these later)
app.use("/api/v1/tours", tours_1.tourRoutes);
app.use("/api/v1/auth", auth_1.authRoutes);
app.use("/api/v1/bookings", booking_routes_1.default);
app.use("/api/v1/payment", payment_routes_1.default);
app.use("/api/v1/reviews", review_routes_1.default);
app.use("/api/v1/admin", admin_routes_1.default);
app.use("/api/v1/upload", upload_routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map