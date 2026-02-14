import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from "cookie-parser";

// Middleware Imports
import { apiLimiter, checkOrigin } from '@common/middleware/security.middleware';

// Route Imports
import { authRoutes } from "../modules/auth"; // Check if this is named or default export!
import { tourRoutes } from "../modules/tours"; // Check if this is named or default export!
import bookingRoutes from "@modules/bookings/api/booking.routes";
import paymentRoutes from "@modules/payments/payment.routes";
import reviewRoutes from "@modules/reviews/review.routes";
import adminRoutes from "@modules/admin/admin.routes";
import uploadRoutes from "@modules/upload/upload.routes";

const app: Application = express();

// ==========================================
// 🚨 CRITICAL FIX FOR RENDER DEPLOYMENT 🚨
// ==========================================
// This tells Express to trust the "X-Forwarded-For" header from Render's Load Balancer.
// Without this, rate-limiting breaks and the app crashes.
app.set('trust proxy', 1);

// ==========================================
// 1. Global Basics (Must be first)
// ==========================================
app.use(express.json());  // Parse JSON bodies
app.use(cookieParser());  // Parse cookies
app.use(helmet());        // Security headers

// CORS: Allow Frontend to talk to Backend
// In production, replace '*' with your actual frontend URL
app.use(cors({
    origin: [
        'http://localhost:5173',           // 👈 Your Local Frontend (Vite)
        'http://localhost:5174',           // 👈 Your Local Frontend (Vite)
        'http://localhost:5175',           // 👈 Your Local Frontend (Vite)
        'https://dd-admin-v2.onrender.com', // (Future) Your deployed Admin Panel
        'https://ddtours.in'               // (Future) Your main website
    ],
    credentials: true, // 👈 CRITICAL: Allows cookies (Refresh Token) to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


// ==========================================
// 2. Health Check (CRITICAL: Place BEFORE strict security)
// ==========================================
// Render hits this to know if the app is alive.
// It must NOT be blocked by rate limiters or origin checks.
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        message: 'DD Tours & Travels V2 API is running! 🚀',
        env: process.env.NODE_ENV, // Helpful for debugging
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// 3. Strict Security (Apply only to API routes)
// ==========================================
app.use('/api', apiLimiter); // Only limit API calls, not health checks
app.use('/api', checkOrigin); // Only check origin for API calls

// ==========================================
// 4. Register Routes
// ==========================================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/upload", uploadRoutes);

export default app;