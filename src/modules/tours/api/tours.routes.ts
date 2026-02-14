import { Router } from "express";
import {
    createTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour
} from "./tours.controller";
import { authenticate, requireAdmin } from "@common/middleware/auth.middleware";
import { validateRequest } from "@common/middleware/validateRequest";
import { createTourValidation, updateTourValidation } from "./../core/tours.validation";

const router = Router();

// 🔓 Public Routes (Cached)
router.get("/", getAllTours);
router.get("/:slug", getSingleTour);

// 🔒 Protected Routes (Admin Only)
router.post(
    "/",
    authenticate,
    requireAdmin,
    validateRequest(createTourValidation), // Zod Validation
    createTour
);

router.patch(
    "/:tourId",
    authenticate,
    requireAdmin,
    validateRequest(updateTourValidation),
    updateTour
);

router.delete(
    "/:tourId",
    authenticate,
    requireAdmin,
    deleteTour
);

export default router;