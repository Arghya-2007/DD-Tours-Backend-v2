"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBlacklist = exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = __importDefault(require("../../app/redis"));
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_fallback";
const authenticate = (req, res, next) => {
    // 1. Get token from header (Authorization: Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // 2. Verify Token
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        req.user = decoded; // Attach user to request
        next(); // Pass to next handler
    }
    catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};
exports.authenticate = authenticate;
// Admin Guard (Only allow if role is ADMIN)
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const checkBlacklist = async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return next(); // If no token, let the next guard handle it
    // Check Redis
    const isBlacklisted = await redis_1.default.get(`blacklist:${token}`);
    if (isBlacklisted) {
        return res.status(403).json({ message: "Session expired. Please login again." });
    }
    next();
};
exports.checkBlacklist = checkBlacklist;
//# sourceMappingURL=auth.middleware.js.map