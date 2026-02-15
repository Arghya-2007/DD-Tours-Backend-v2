import { Router } from "express";
import {
    createTour,
    getAllTours,
    getSingleTour,
    getTourById,   // 👈 NEW: For Admin Edit
    getTourStats,  // 👈 NEW: For Dashboard Charts
    updateTour,
    deleteTour
} from "./tours.controller"; // Ensure filename matches (tour vs tours)
import { authenticate, requireAdmin } from "@common/middleware/auth.middleware";
import { validateRequest } from "@common/middleware/validateRequest";
import { createTourValidation, updateTourValidation } from "./../core/tours.validation";

const router = Router();

// ==========================================
// 🔓 PUBLIC ROUTES (Order Matters!)
// ==========================================

// 1. Get All Tours (List)
router.get("/", getAllTours);

// ==========================================
// 🔒 ADMIN ROUTES (Protected)
// ==========================================

// 2. Get Stats (MUST come before /:slug)
// Usage: GET /api/v1/tours/stats
router.get(
    "/stats",
    authenticate,
    requireAdmin,
    getTourStats
);

// 3. Get Tour by ID (For Edit Page)
// Usage: GET /api/v1/tours/id/123-abc
router.get(
    "/id/:tourId",
    authenticate,
    requireAdmin,
    getTourById
);

// 4. Create Tour
router.post(
    "/",
    authenticate,
    requireAdmin,
    validateRequest(createTourValidation),
    createTour
);

// 5. Update Tour
router.patch(
    "/:tourId",
    authenticate,
    requireAdmin,
    validateRequest(updateTourValidation),
    updateTour
);

// 6. Delete Tour
router.delete(
    "/:tourId",
    authenticate,
    requireAdmin,
    deleteTour
);

// ==========================================
// 🔓 DYNAMIC PUBLIC ROUTES (Catch-All)
// ==========================================

// 7. Get Single Tour by Slug (MUST be last GET route)
// Usage: GET /api/v1/tours/grand-goa-trip
router.get("/:slug", getSingleTour);

export default router;