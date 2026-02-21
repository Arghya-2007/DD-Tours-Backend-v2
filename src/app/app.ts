import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import { apiLimiter } from '@common/middleware/security.middleware';

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
import userRoutes from "@modules/user/api/user.routes";

const app: Application = express();

// ==========================================
// 🚨 CRITICAL FIX 1: Trust Render's Proxy
// ==========================================
app.set('trust proxy', 1);

// ==========================================
// 🚨 CRITICAL FIX 2: Correct CORS Configuration
// ==========================================
const allowedOrigins = [
    'https://ddtours.in', // If you have a separate Render frontend
    'https://www.ddtours.in',
    'https://admin.ddtours.in',
    'http://localhost:5173',                // Local Development
    'http://localhost:3000'                 // Vite Preview
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman, Mobile Apps, or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Allowed
        } else {
            console.error(`Blocked by CORS: ${origin}`); // Log the blocked origin for debugging
            callback(new Error('Not allowed by CORS')); // Blocked
        }
    },
    credentials: true, // 👈 KEY: Allows cookies (Refresh Token)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// 1. Apply CORS globally
app.use(cors(corsOptions));

// 2. Handle Preflight Requests Explicitly
app.options('*', cors(corsOptions));

// ==========================================
// 3. Global Basics & Security
// ==========================================
// Increase limit for image uploads (base64) if needed, otherwise 10kb is fine
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 🚨 NEW FIX: Relaxed Helmet policy so Vercel can read resources from Render
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

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
// Note: Ensure apiLimiter is configured correctly to not block your own Admin panel
app.use('/api', apiLimiter);

// ==========================================
// 6. Register Routes
// ==========================================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/user", userRoutes);

// ==========================================
// 🚨 NEW FIX: Global Error Handler
// ==========================================
// This must be the very last middleware!
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("🔥 Global Error Caught:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;