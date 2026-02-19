import { Request, Response } from "express";
import * as userService from "../core/user.service";

// Helper interface to assume 'user' exists on Request (from Auth Middleware)
interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// 1. GET Profile
export const getProfileHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await userService.getUserProfile(userId);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// 2. PATCH Update Profile
export const updateProfileHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updatedUser = await userService.updateUserProfile(userId, req.body);
    res.status(200).json({ success: true, message: "Profile updated", data: updatedUser });
  } catch (error: any) {
    res.status(400).json({ success: false, message: "Failed to update profile" });
  }
};

// 3. DELETE Profile
export const deleteProfileHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await userService.deleteUserProfile(userId);

    // Optional: Clear cookies upon deletion
    res.clearCookie("refreshToken");

    res.status(200).json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Could not delete account. You may have active bookings." });
  }
};