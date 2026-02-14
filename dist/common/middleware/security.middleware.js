"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOrigin = exports.loginLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// 1. Rate Limiter: Allow only 100 requests per 15 minutes per IP
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
// 2. Login Limiter: Strict limit for login (5 attempts per hour)
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many login attempts, please try again after an hour',
});
// 3. Simple CSRF/Origin Check
const checkOrigin = (req, res, next) => {
    const allowedOrigins = ['https://ddtours.in', 'http://localhost:3000'];
    const origin = req.headers.origin;
    // Allow non-browser requests (like Postman) if you want, or block them
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ message: 'CORS/CSRF Policy Violation' });
    }
    next();
};
exports.checkOrigin = checkOrigin;
//# sourceMappingURL=security.middleware.js.map