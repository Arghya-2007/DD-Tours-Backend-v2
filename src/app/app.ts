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
// 1. Global Basics (Must be first)
// ==========================================
app.use(express.json());  // Parse JSON bodies
app.use(cookieParser());  // Parse cookies
app.use(helmet());        // Security headers

// CORS: Allow Frontend to talk to Backend
// In production, replace '*' with your actual frontend URL
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow all or specific frontend
    credentials: true, // Allow cookies
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