import express, { Application, Request, Response } from 'express';
import cors from 'cors'; // ✅ We will actually use this now
import helmet from 'helmet';
import cookieParser from "cookie-parser";

// Middleware Imports
import { apiLimiter } from '@common/middleware/security.middleware';
// ⚠️ Note: I removed 'checkOrigin' from imports because standard cors() handles this better.

// Route Imports
import { authRoutes } from "../modules/auth";
import { tourRoutes } from "../modules/tours";
import bookingRoutes from "@modules/bookings/api/booking.routes";
import paymentRoutes from "@modules/payments/payment.routes";
import reviewRoutes from "@modules/reviews/review.routes";
import adminRoutes from "@modules/admin/admin.routes";
import uploadRoutes from "@modules/upload/upload.routes";
import settingsRoutes from "@modules/settings/settings.routes";
import blogRoutes from "@modules/blog/blog.routes";

const app: Application = express();

// ==========================================
// 🚨 CRITICAL FIX 1: Trust Render's Proxy
// ==========================================
app.set('trust proxy', 1);

// ==========================================
// 🚨 CRITICAL FIX 2: Correct CORS Configuration
// ==========================================
const allowedOrigins = [
    'https://dd-tours-backend-v2.onrender.com',
    'https://dd-admin-v2.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174'
];

const corsOptions = {
    origin: (origin: any, callback: any) => {
        // Allow requests with no origin (like Postman, Mobile Apps, or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Allowed
        } else {
            callback(new Error('Not allowed by CORS')); // Blocked
        }
    },
    credentials: true, // 👈 KEY: Allows cookies (Refresh Token)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// 1. Apply CORS immediately
app.use(cors(corsOptions));

// 2. Handle Preflight Requests Explicitly
app.options('*', cors(corsOptions));


// ==========================================
// 3. Global Basics
// ==========================================
app.use(express.json({ limit: '10kb' })); // Added limit for safety
app.use(cookieParser());
app.use(helmet());

// ==========================================
// 4. Health Check
// ==========================================
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        message: 'DD Tours & Travels V2 API is running! 🚀',
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// 5. Rate Limiting (Apply only to API routes)
// ==========================================
app.use('/api', apiLimiter);

// ==========================================
// 6. Register Routes
// ==========================================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/blogs", blogRoutes)
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/settings", settingsRoutes);

export default app;