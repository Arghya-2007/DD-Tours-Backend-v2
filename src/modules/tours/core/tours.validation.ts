import { z } from 'zod';

// 1. Define the Base Schema (Plain object, no refinements yet)
const tourBodySchema = z.object({
    tourTitle: z.string().min(5, "Title must be at least 5 chars long"),
    slug: z.string().optional(),
    tourDuration: z.string().min(1, "Duration is required (e.g. '5 Days')"),
    tourDescription: z.string().min(20, "Description allows users to know more!"),
    tourPrice: z.number().min(1, "Price must be a positive number"),
    maxSeats: z.number().int().positive(),

    // Dates
    isFixedDate: z.boolean().optional(),
    fixedDate: z.string().datetime().optional().nullable(),
    expectedMonth: z.string().optional().nullable(),

    // Arrays
    coveredPlaces: z.array(z.string()).min(1, "At least 1 place must be covered"),
    includedItems: z.array(z.string()).optional(),
    images: z.array(z.string().url()).min(1, "At least 1 image is required"),

    // Status
    tourStatus: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).optional()
});

// 2. Create Schema: Add the Refinement here
export const createTourValidation = z.object({
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
export const updateTourValidation = z.object({
    body: tourBodySchema.partial()
});