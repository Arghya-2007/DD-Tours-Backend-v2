import { Router } from "express";
import { getProfileHandler, updateProfileHandler, deleteProfileHandler } from "./user.controller";
import { authenticate } from "@common/middleware/auth.middleware"; // Assuming you have this!

const router = Router();

// All routes here are protected
router.use(authenticate);

// GET /api/v1/user/me
router.get("/me", getProfileHandler);

// PATCH /api/v1/user/update-profile
router.patch("/update-profile", updateProfileHandler);

// DELETE /api/v1/user/delete-account
router.delete("/delete-account", deleteProfileHandler);

export default router;