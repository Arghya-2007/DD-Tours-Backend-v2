"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const router = (0, express_1.Router)();
// 🔒 Protected Route: Only Admins can access
router.get("/stats", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, admin_controller_1.getStats);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map