"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected Routes
router.post("/create-order", auth_middleware_1.authenticate, payment_controller_1.initiatePayment);
router.post("/verify", auth_middleware_1.authenticate, payment_controller_1.verifyPayment);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map