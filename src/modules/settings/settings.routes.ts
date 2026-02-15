import { Router } from "express";
import { getSettings, updateSettings } from "./settings.controller";
import { authenticate, requireAdmin } from "@common/middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, requireAdmin, getSettings);
router.patch("/", authenticate, requireAdmin, updateSettings);

export default router;