import { Request, Response } from "express";
import * as authService from "../core/auth.service";

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
    } catch (error: any) {
        res.status(401).json({ success: false, message: error.message });
    }
};

// Logout Handler
// ... imports

export const logoutHandler = async (req: Request, res: Response) => {
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
    } catch (error) {
        res.status(500).json({ success: false, message: "Logout failed" });
    }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        // Service will throw error if token is invalid
        const { newAccessToken, user} = await authService.refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            user: { id: user.userId, name: user.userName, role: user.role }
        });

    } catch (error) {
        res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
    }
};