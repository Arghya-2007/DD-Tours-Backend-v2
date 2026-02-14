import { Router } from "express";
import { getStats } from "./admin.controller";
import {authenticate, requireAdmin,} from "@common/middleware/auth.middleware";

const router = Router();

// 🔒 Protected Route: Only Admins can access
router.get("/stats", authenticate, requireAdmin, getStats);

export default router;