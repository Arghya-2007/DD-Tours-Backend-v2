"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.registerHandler);
router.post("/login", auth_controller_1.loginHandler);
router.post("/logout", auth_controller_1.logoutHandler);
router.post("/refresh-token", auth_middleware_1.checkBlacklist, auth_controller_1.refreshTokenHandler);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map