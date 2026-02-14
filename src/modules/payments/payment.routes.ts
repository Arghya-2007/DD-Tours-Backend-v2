import { Router } from "express";
import { initiatePayment, verifyPayment } from "./payment.controller";
import { authenticate } from "@common/middleware/auth.middleware";

const router = Router();

// Protected Routes
router.post("/create-order", authenticate, initiatePayment);
router.post("/verify", authenticate, verifyPayment);

export default router;