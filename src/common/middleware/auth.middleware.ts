import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import redis from "../../app/redis";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_fallback";

// Extend Express Request to include 'user'
export interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET) as { userId: string; role: string };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }
};

// Admin Guard (Always use AFTER authenticate)
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
};

export const checkBlacklist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) return next();

        // Check Redis safely
        const isBlacklisted = await redis.get(`blacklist:${token}`);

        if (isBlacklisted) {
            return res.status(403).json({ message: "Session expired. Please login again." });
        }

        next();
    } catch (error) {
        console.error("Redis Blacklist Check Failed:", error);
        next(error); // Passes to App.ts global error handler
    }
};