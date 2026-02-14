"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("./review.controller");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const router = (0, express_1.Router)();
// 🔒 User must be logged in to write a review
router.post("/", auth_middleware_1.authenticate, review_controller_1.createReview);
// 🔓 Anyone can read the "Wall of Love"
router.get("/", review_controller_1.getAllReviews);
exports.default = router;
//# sourceMappingURL=review.routes.js.map