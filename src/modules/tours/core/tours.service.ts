import prisma from "../../../app/database";
import { Tour, Prisma } from "@prisma/client";

// Helper: Simple Slug Generator (e.g., "Grand Goa Trip" -> "grand-goa-trip")
const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// ==========================================
// 1. CREATE TOUR
// ==========================================
export const createTourIntoDB = async (payload: any): Promise<Tour> => {
    // 1. Auto-generate slug if missing
    let slug = payload.slug || generateSlug(payload.tourTitle);

    // 2. Ensure Slug is Unique (Append random string if exists)
    const existing = await prisma.tour.findUnique({ where: { slug } });
    if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // 3. Create Tour
    return prisma.tour.create({
        data: {
            ...payload,
            slug, // Final unique slug
            // Ensure numbers are numbers (in case FormData sent strings)
            tourPrice: Number(payload.tourPrice),
            maxSeats: Number(payload.maxSeats),
            availableSeats: Number(payload.maxSeats) // Initially full capacity
        }
    });
};

// ==========================================
// 2. GET ALL TOURS (Advanced Filtering)
// ==========================================
export const getAllToursFromDB = async (query: any) => {
    const {
        page = 1,
        limit = 10,
        searchTerm,
        sort = 'createdAt',
        sortOrder = 'desc',
        minPrice,
        maxPrice,
        tourCategory, // 👈 New Schema Field
        startLocation // 👈 New Schema Field
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build Search Conditions
    const whereConditions: Prisma.TourWhereInput = { AND: [] };

    // A. Full Text Search
    if (searchTerm) {
        (whereConditions.AND as Prisma.TourWhereInput[]).push({
            OR: [
                { tourTitle: { contains: searchTerm, mode: 'insensitive' } },
                { tourDescription: { contains: searchTerm, mode: 'insensitive' } },
                { startLocation: { contains: searchTerm, mode: 'insensitive' } },
                // Note: Searching inside string arrays (coveredPlaces) varies by DB.
                // For Postgres/Prisma, strict match is easier, exact text search is harder without raw query.
            ]
        });
    }

    // B. Category Filter
    if (tourCategory && tourCategory !== 'ALL') {
        (whereConditions.AND as Prisma.TourWhereInput[]).push({
            tourCategory: { equals: tourCategory, mode: 'insensitive' }
        });
    }

    // C. Price Range
    if (minPrice || maxPrice) {
        (whereConditions.AND as Prisma.TourWhereInput[]).push({
            tourPrice: {
                gte: minPrice ? Number(minPrice) : undefined,
                lte: maxPrice ? Number(maxPrice) : undefined
            }
        });
    }

    // D. Location Filter
    if (startLocation) {
        (whereConditions.AND as Prisma.TourWhereInput[]).push({
            startLocation: { contains: startLocation, mode: 'insensitive' }
        });
    }

    // Execute Query
    const result = await prisma.tour.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy: {
            [sort as string]: sortOrder // e.g., tourPrice: 'asc'
        }
    });

    const total = await prisma.tour.count({ where: whereConditions });

    return {
        meta: { page: Number(page), limit: Number(limit), total },
        data: result
    };
};

// ==========================================
// 3. GET SINGLE TOUR (By Slug)
// ==========================================
export const getSingleTourFromDB = async (slug: string) => {
    return prisma.tour.findUnique({
        where: { slug }
    });
};

// ==========================================
// 4. GET SINGLE TOUR (By ID) - 🆕 Added
// ==========================================
export const getTourByIdFromDB = async (tourId: string) => {
    return prisma.tour.findUnique({
        where: { tourId }
    });
};

// ==========================================
// 5. UPDATE TOUR
// ==========================================
export const updateTourInDB = async (id: string, payload: Partial<Tour>) => {
    // Optional: If title changes, should we update slug?
    // Usually NO, to preserve SEO links. So we ignore slug updates here.

    // Ensure numeric fields are numbers
    const safePayload = { ...payload };
    if(safePayload.tourPrice) safePayload.tourPrice = Number(safePayload.tourPrice);
    if(safePayload.maxSeats) safePayload.maxSeats = Number(safePayload.maxSeats);

    return prisma.tour.update({
        where: { tourId: id },
        data: safePayload
    });
};

// ==========================================
// 6. DELETE TOUR
// ==========================================
export const deleteTourFromDB = async (id: string) => {
    return prisma.tour.delete({
        where: { tourId: id }
    });
};

// ==========================================
// 7. GET STATS - 🆕 Added for Admin Dashboard
// ==========================================
export const getTourStatsFromDB = async () => {
    // 1. Group by Category
    const categoryStats = await prisma.tour.groupBy({
        by: ['tourCategory'],
        _count: { tourId: true },
        _avg: { tourPrice: true }
    });

    // 2. Get Total Bookings & Revenue (Optional, if you want it here)
    const totalTours = await prisma.tour.count();

    return {
        totalTours,
        categoryBreakdown: categoryStats
    };
};