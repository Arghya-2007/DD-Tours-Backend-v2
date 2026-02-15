import { z } from 'zod';

// 1. Define the Base Body Schema
const tourBodySchema = z.object({
    // Basic Details
    tourTitle: z.string().min(5, "Title must be at least 5 chars long"),
    slug: z.string().optional(),

    // 🆕 NEW FIELDS (Make them optional if you want flexibility, or required for strictness)
    startLocation: z.string().min(3, "Start Location is required (e.g., 'Delhi')").optional().or(z.literal('')),
    tourCategory: z.string().min(3, "Category is required (e.g., 'Adventure')").optional().or(z.literal('')),

    tourDuration: z.string().min(1, "Duration is required (e.g. '5 Days')"),
    tourDescription: z.string().min(20, "Description must be at least 20 chars long"),
    tourPrice: z.number().min(1, "Price must be a positive number"),

    // Seats
    maxSeats: z.number().int().positive("Max seats must be a positive integer"),
    availableSeats: z.number().int().optional(), // Optional on create (defaults to maxSeats)

    // Dates
    isFixedDate: z.boolean().optional(),
    // Allow string (ISO) or null/undefined
    fixedDate: z.string().datetime().optional().nullable(),
    bookingDeadline: z.string().datetime().optional().nullable(),
    expectedMonth: z.string().optional().nullable(),

    // Arrays
    coveredPlaces: z.array(z.string()).min(1, "At least 1 covered place is required"),
    includedItems: z.array(z.string()).optional(),
    images: z.array(z.string().url()).min(1, "At least 1 image is required"),

    // Status
    tourStatus: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).optional()
});

// 2. CREATE VALIDATION
// We use .refine to ensure Date Logic is correct
export const createTourValidation = z.object({
    body: tourBodySchema.refine((data) => {
        // Logic 1: If Fixed Date is TRUE, you MUST have a fixedDate
        if (data.isFixedDate && !data.fixedDate) return false;

        // Logic 2: If Fixed Date is FALSE, you SHOULD have an expectedMonth (optional but good practice)
        // if (!data.isFixedDate && !data.expectedMonth) return false;

        return true;
    }, {
        message: "If the tour is a Fixed Date tour, you must provide the 'Fixed Date' value.",
        path: ["fixedDate"] // Attaches error to this specific field
    })
});

// 3. UPDATE VALIDATION
// We use .partial() so you can update just the price or just the title
export const updateTourValidation = z.object({
    body: tourBodySchema.partial()
});