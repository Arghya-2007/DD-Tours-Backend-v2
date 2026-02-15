import { Router } from "express";
import {createReview, deleteReview, getAllReviews} from "./review.controller";
import {authenticate, requireAdmin} from "@common/middleware/auth.middleware";

const router = Router();

// 🔒 User must be logged in to write a review
router.post("/", authenticate, createReview);

// 🔓 Anyone can read the "Wall of Love"
router.get("/", getAllReviews);

// Protected (Admin)
router.delete("/:reviewId", authenticate, requireAdmin, deleteReview);

export default router;