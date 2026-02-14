"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenHandler = exports.logoutHandler = exports.loginHandler = exports.registerHandler = void 0;
const authService = __importStar(require("../core/auth.service"));
// Register Handler
const registerHandler = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, message: "User registered!", data: user });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.registerHandler = registerHandler;
// Login Handler
const loginHandler = async (req, res) => {
    try {
        const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
        // 🍪 SET SECURE COOKIE (HttpOnly)
        // This prevents XSS attacks because JS cannot read this cookie.
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            // 'lax' allows the cookie to be sent when user navigates to your site
            // 'strict' is safer but might break if user clicks a link to your site from email
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : 'lax',
            domain: process.env.NODE_ENV === "production" ? ".ddtours.in" : undefined, // <--- CRITICAL FOR GATEWAY
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken, // Frontend stores this in memory (not localStorage)
            user
        });
    }
    catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};
exports.loginHandler = loginHandler;
// Logout Handler
// ... imports
const logoutHandler = async (req, res) => {
    try {
        // 1. Get the refresh token from the cookie
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            // 2. Blacklist it in Redis
            await authService.logoutUser(refreshToken);
        }
        // 3. Clear the cookie from the browser
        res.clearCookie("refreshToken");
        res.status(200).json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Logout failed" });
    }
};
exports.logoutHandler = logoutHandler;
const refreshTokenHandler = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }
        // Service will throw error if token is invalid
        const { newAccessToken } = await authService.refreshAccessToken(refreshToken);
        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    }
    catch (error) {
        res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
    }
};
exports.refreshTokenHandler = refreshTokenHandler;
//# sourceMappingURL=auth.controller.js.map