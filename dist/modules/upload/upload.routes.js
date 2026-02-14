"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = require("../../common/middleware/upload.middleware");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const upload_controller_1 = require("../upload/upload.controller");
const router = (0, express_1.Router)();
// 🔒 Only logged-in users can upload
// 'image' is the key name you must use in Postman
router.post("/", auth_middleware_1.authenticate, upload_middleware_1.upload.array("images", 10), upload_controller_1.uploadFiles);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map