import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from "../modules/auth";
import cookieParser from "cookie-parser";
import { apiLimiter, checkOrigin } from '@common/middleware/security.middleware';
import { tourRoutes } from "../modules/tours";
import bookingRoutes from "@modules/bookings/api/booking.routes";
import paymentRoutes from "@modules/payments/payment.routes";
import reviewRoutes from "@modules/reviews/review.routes";
import adminRoutes from "@modules/admin/admin.routes";
import uploadRoutes from "@modules/upload/upload.routes";


const app: Application = express();

// 1. Global Middleware
app.use(cors());          // Allow requests from frontend
app.use(helmet());        // Security headers
app.use(express.json());  // Parse JSON bodies
app.use(cookieParser());  // add cookies
app.use('/api', apiLimiter);
app.use(checkOrigin);

// 2. Health Check Route (Good for testing)
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        message: 'DD Tours & Travels V2 API is running! 🚀',
        timestamp: new Date().toISOString()
    });
});

// 3. Register Module Routes (We will add these later)
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/upload", uploadRoutes);


export default app;