import { Request, Response } from "express";
import * as authService from "../core/auth.service";

// ==========================================
// Reusable Base Cookie Options
// ==========================================
const getBaseCookieOptions = () => ({
    httpOnly: true, // Prevents XSS
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: (process.env.NODE_ENV === "production" ? 'none' : 'lax') as 'none' | 'lax',
    // 🚨 Notice: 'domain' is removed so it works natively across Render/Vercel
});

// Register Handler
export const registerHandler = async (req: Request, res: Response) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, message: "User registered!", data: user });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Login Handler
export const loginHandler = async (req: Request, res: Response) => {
    try {
        const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

        // 🚨 ARCHITECTURE UPGRADE: Role-based Cookie Strategy
        const cookieOptions: any = getBaseCookieOptions();

        if (user.role !== "ADMIN") {
            // USERS get a Persistent Cookie (survives tab close, lasts 7 days)
            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
        }
        // ADMINS get a Session Cookie (no maxAge set)
        // The browser automatically deletes this when the tab/window is closed!

        res.cookie("refreshToken", refreshToken, cookieOptions);

        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken, // Frontend stores this in memory
            user
        });
    } catch (error: any) {
        res.status(401).json({ success: false, message: error.message });
    }
};

// Logout Handler
export const logoutHandler = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // Blacklist it in Redis
            await authService.logoutUser(refreshToken);
        }

        // 🚨 CRITICAL FIX: Must pass the exact same base flags to successfully delete cross-site cookies
        res.clearCookie("refreshToken", getBaseCookieOptions());

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Logout failed" });
    }
};

// Refresh Token Handler
export const refreshTokenHandler = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const { newAccessToken, user } = await authService.refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            user: {
                id: user.userId,
                name: user.userName,
                role: user.role,
                email: user.userEmail // Ensure email matches your frontend AuthProvider
            }
        });

    } catch (error) {
        res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
    }
};