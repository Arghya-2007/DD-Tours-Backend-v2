"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.loginUser = exports.registerUser = exports.refreshAccessToken = void 0;
const database_1 = __importDefault(require("../../../app/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const redis_1 = __importDefault(require("../../../app/redis"));
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_fallback";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_fallback";
const refreshAccessToken = async (token) => {
    // 1. Verify the Refresh Token
    const decoded = jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
    // 2. Check if user still exists (Optional but safe)
    const user = await database_1.default.user.findUnique({ where: { userId: decoded.userId } });
    if (!user)
        throw new Error("User not found");
    // 3. Issue NEW Access Token
    const newAccessToken = jsonwebtoken_1.default.sign({ userId: user.userId, role: user.role }, ACCESS_SECRET, { expiresIn: "15m" });
    return { newAccessToken };
};
exports.refreshAccessToken = refreshAccessToken;
// 1. REGISTER LOGIC
const registerUser = async (data) => {
    // Check if user exists
    const existingUser = await database_1.default.user.findUnique({
        where: { userEmail: data.userEmail }
    });
    if (existingUser) {
        throw new Error("User with this email already exists!");
    }
    // Hash password (10 rounds is standard)
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    // Create User
    const newUser = await database_1.default.user.create({
        data: {
            userName: data.userName,
            userEmail: data.userEmail,
            password: hashedPassword,
            phoneNumber: data.phoneNumber,
            role: client_1.Role.USER, // Default role
        },
    });
    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};
exports.registerUser = registerUser;
// 2. LOGIN LOGIC
const loginUser = async (data) => {
    const user = await database_1.default.user.findUnique({
        where: { userEmail: data.userEmail }
    });
    if (!user)
        throw new Error("Invalid credentials");
    const isMatch = await bcryptjs_1.default.compare(data.password, user.password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    // Generate Tokens
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.userId, role: user.role }, ACCESS_SECRET, { expiresIn: "15m" } // Short life
    );
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.userId }, REFRESH_SECRET, { expiresIn: "7d" } // Long life
    );
    return {
        user: { id: user.userId, name: user.userName, role: user.role },
        accessToken,
        refreshToken
    };
};
exports.loginUser = loginUser;
const logoutUser = async (token) => {
    // We blacklist the token for 7 days (same time as refresh token expiry)
    // Key: blacklist:token_string, Value: 'true', Expiry: 7 days in seconds
    await redis_1.default.set(`blacklist:${token}`, 'true', 'EX', 7 * 24 * 60 * 60);
    return { message: "Logged out successfully" };
};
exports.logoutUser = logoutUser;
//# sourceMappingURL=auth.service.js.map