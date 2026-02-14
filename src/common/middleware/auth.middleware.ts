import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import redis from "../../app/redis";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_fallback";

// Extend Express Request to include 'user'
export interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Get token from header (Authorization: Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 2. Verify Token
        const decoded = jwt.verify(token, ACCESS_SECRET) as { userId: string; role: string };
        req.user = decoded; // Attach user to request
        next(); // Pass to next handler
    } catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};

// Admin Guard (Only allow if role is ADMIN)
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
};

export const checkBlacklist = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;

    if (!token) return next(); // If no token, let the next guard handle it

    // Check Redis
    const isBlacklisted = await redis.get(`blacklist:${token}`);

    if (isBlacklisted) {
        return res.status(403).json({ message: "Session expired. Please login again." });
    }

    next();
};