"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTourValidation = exports.createTourValidation = void 0;
const zod_1 = require("zod");
// 1. Define the Base Schema (Plain object, no refinements yet)
const tourBodySchema = zod_1.z.object({
    tourTitle: zod_1.z.string().min(5, "Title must be at least 5 chars long"),
    slug: zod_1.z.string().optional(),
    tourDuration: zod_1.z.string().min(1, "Duration is required (e.g. '5 Days')"),
    tourDescription: zod_1.z.string().min(20, "Description allows users to know more!"),
    tourPrice: zod_1.z.number().min(1, "Price must be a positive number"),
    maxSeats: zod_1.z.number().int().positive(),
    // Dates
    isFixedDate: zod_1.z.boolean().optional(),
    fixedDate: zod_1.z.string().datetime().optional().nullable(),
    expectedMonth: zod_1.z.string().optional().nullable(),
    // Arrays
    coveredPlaces: zod_1.z.array(zod_1.z.string()).min(1, "At least 1 place must be covered"),
    includedItems: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.string().url()).min(1, "At least 1 image is required"),
    // Status
    tourStatus: zod_1.z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).optional()
});
// 2. Create Schema: Add the Refinement here
exports.createTourValidation = zod_1.z.object({
    body: tourBodySchema.refine((data) => {
        // Logic: If isFixedDate is true, fixedDate MUST be provided
        return !(data.isFixedDate && !data.fixedDate);
    }, {
        message: "If the tour has a fixed date, you must provide the 'fixedDate'",
        path: ["fixedDate"]
    })
});
// 3. Update Schema: Use the Base Schema for .partial()
// We don't use refine here because PATCH updates might not send all fields
exports.updateTourValidation = zod_1.z.object({
    body: tourBodySchema.partial()
});
//# sourceMappingURL=tours.validation.js.map