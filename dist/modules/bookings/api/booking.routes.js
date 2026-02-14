"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("./booking.controller");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const validateRequest_1 = require("../../../common/middleware/validateRequest");
const booking_validation_1 = require("./../core/booking.validation");
const router = (0, express_1.Router)();
// Only logged-in users can book
router.post("/", auth_middleware_1.authenticate, (0, validateRequest_1.validateRequest)(booking_validation_1.createBookingSchema), booking_controller_1.createBooking);
router.get("/", auth_middleware_1.authenticate, booking_controller_1.getBookings);
exports.default = router;
//# sourceMappingURL=booking.routes.js.map