import { Router } from "express";
import { createReview, getAllReviews } from "./review.controller";
import { authenticate } from "@common/middleware/auth.middleware";

const router = Router();

// 🔒 User must be logged in to write a review
router.post("/", authenticate, createReview);

// 🔓 Anyone can read the "Wall of Love"
router.get("/", getAllReviews);

export default router;