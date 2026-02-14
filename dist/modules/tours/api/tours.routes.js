"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tours_controller_1 = require("./tours.controller");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const validateRequest_1 = require("../../../common/middleware/validateRequest");
const tours_validation_1 = require("./../core/tours.validation");
const router = (0, express_1.Router)();
// 🔓 Public Routes (Cached)
router.get("/", tours_controller_1.getAllTours);
router.get("/:slug", tours_controller_1.getSingleTour);
// 🔒 Protected Routes (Admin Only)
router.post("/", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, validateRequest_1.validateRequest)(tours_validation_1.createTourValidation), // Zod Validation
tours_controller_1.createTour);
router.patch("/:tourId", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, validateRequest_1.validateRequest)(tours_validation_1.updateTourValidation), tours_controller_1.updateTour);
router.delete("/:tourId", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, tours_controller_1.deleteTour);
exports.default = router;
//# sourceMappingURL=tours.routes.js.map