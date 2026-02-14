import { Request, Response } from "express";
import * as reviewService from "./review.service";
import { AuthRequest } from "@common/middleware/auth.middleware";

// Create (Protected)
export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new Error("Unauthorized");

        const result = await reviewService.createReviewIntoDB(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Review posted! Thank you for your feedback.",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All (Public - For Testimonials Page)
export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const result = await reviewService.getAllReviews();

        res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};