import prisma from "../../../app/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role } from "@prisma/client";
import redis from "../../../app/redis";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_fallback";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_fallback";

export const refreshAccessToken = async (token: string) => {
    // 🚨 CRITICAL SECURITY FIX: Check if token is blacklisted in Redis first!
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) throw new Error("Token has been revoked. Please log in again.");

    // 1. Verify the Refresh Token
    const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };

    // 2. Check if user still exists (Optional but safe)
    const user = await prisma.user.findUnique({ where: { userId: decoded.userId } });
    if (!user) throw new Error("User not found");

    // 3. Issue NEW Access Token
    const newAccessToken = jwt.sign(
        { userId: user.userId, role: user.role },
        ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    return { newAccessToken, user };
};

// 1. REGISTER LOGIC
export const registerUser = async (data: any) => {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { userEmail: data.userEmail }
    });

    if (existingUser) {
        throw new Error("User with this email already exists!");
    }

    // Hash password (10 rounds is standard)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create User
    const newUser = await prisma.user.create({
        data: {
            userName: data.userName,
            userEmail: data.userEmail,
            password: hashedPassword,
            phoneNumber: data.phoneNumber,
            role: Role.USER, // Default role
        },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

// 2. LOGIN LOGIC
export const loginUser = async (data: any) => {
    const user = await prisma.user.findUnique({
        where: { userEmail: data.userEmail }
    });

    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    // Generate Access Token (Always short-lived)
    const accessToken = jwt.sign(
        { userId: user.userId, role: user.role },
        ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    // 🚨 ARCHITECTURE FIX: Dynamic Refresh Token Lifespans based on Role
    // Admins get a strict 1-day token limit. Users get 7 days.
    const refreshExpiresIn = user.role === Role.ADMIN ? "1d" : "7d";

    const refreshToken = jwt.sign(
        { userId: user.userId },
        REFRESH_SECRET,
        { expiresIn: refreshExpiresIn }
    );

    return {
        user: {
            id: user.userId,
            name: user.userName,
            role: user.role,
            email: user.userEmail
        },
        accessToken,
        refreshToken
    };
};

export const logoutUser = async (token: string) => {
    // Blacklist the token in Redis for 7 days maximum
    await redis.set(`blacklist:${token}`, 'true', 'EX', 7 * 24 * 60 * 60);
    return { message: "Logged out successfully" };
};