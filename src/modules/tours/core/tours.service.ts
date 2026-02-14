import prisma from "../../../app/database";
import { Tour, Prisma } from "@prisma/client";
import { ITourFilterRequest } from "./tours.interface";
import { generateSlug } from "@common/utils/slugGenerator"; // (We will create this util later)

// 1. Create Tour
export const createTourIntoDB = async (payload: any): Promise<Tour> => {
    // Auto-generate slug if not provided
    if (!payload.slug) {
        payload.slug = generateSlug(payload.tourTitle);
    }

    // Check for duplicate slug
    const existing = await prisma.tour.findUnique({ where: { slug: payload.slug } });
    if (existing) {
        throw new Error("Tour with this name already exists!");
    }

    return prisma.tour.create({
        data: {
            ...payload,
            availableSeats: payload.maxSeats // Initially, available = max
        }
    });
};

// 2. Get All Tours (Advanced Filtering)
export const getAllToursFromDB = async (filters: ITourFilterRequest) => {
    const { searchTerm, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', minPrice, maxPrice, ...filterData } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const andConditions: Prisma.TourWhereInput[] = [];

    // A. Search Implementation (Title, Description, or Places)
    if (searchTerm) {
        andConditions.push({
            OR: [
                { tourTitle: { contains: searchTerm, mode: 'insensitive' } },
                { tourDescription: { contains: searchTerm, mode: 'insensitive' } },
                { coveredPlaces: { hasSome: [searchTerm] } } // Searches inside the array!
            ]
        });
    }

    // B. Price Filter
    if (minPrice || maxPrice) {
        andConditions.push({
            tourPrice: {
                gte: minPrice ? Number(minPrice) : undefined,
                lte: maxPrice ? Number(maxPrice) : undefined
            }
        });
    }

    // C. Exact Match Filters (e.g., tourStatus: "UPCOMING")
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: (filterData as any)[key]
            }))
        });
    }

    // D. Execute Query
    const whereConditions: Prisma.TourWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.tour.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.tour.count({ where: whereConditions });

    return {
        meta: { page, limit, total },
        data: result
    };
};

// 3. Get Single Tour
export const getSingleTourFromDB = async (slug: string) => {
    return prisma.tour.findUnique({
        where: {slug}
    });
};

// 4. Update Tour
export const updateTourInDB = async (id: string, payload: Partial<Tour>) => {
    return prisma.tour.update({
        where: {tourId: id},
        data: payload
    });
};

// 5. Delete Tour
export const deleteTourFromDB = async (id: string) => {
    return prisma.tour.delete({
        where: {tourId: id}
    });
}