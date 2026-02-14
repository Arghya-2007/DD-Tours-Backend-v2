import { Router } from "express";
import { registerHandler, loginHandler, logoutHandler, refreshTokenHandler } from "./auth.controller";
import { checkBlacklist } from "@common/middleware/auth.middleware";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/logout", logoutHandler);

router.post("/refresh-token", checkBlacklist, refreshTokenHandler);

export default router;