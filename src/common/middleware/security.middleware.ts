import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// 1. Rate Limiter: Allow only 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. Login Limiter: Strict limit for login (5 attempts per hour)
export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many login attempts, please try again after an hour',
});

// 3. Simple CSRF/Origin Check
export const checkOrigin = (req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = ['https://ddtours.in', 'http://localhost:3000'];
    const origin = req.headers.origin;

    // Allow non-browser requests (like Postman) if you want, or block them
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ message: 'CORS/CSRF Policy Violation' });
    }
    next();
};