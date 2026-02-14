"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTourFromDB = exports.updateTourInDB = exports.getSingleTourFromDB = exports.getAllToursFromDB = exports.createTourIntoDB = void 0;
const database_1 = __importDefault(require("../../../app/database"));
const slugGenerator_1 = require("../../../common/utils/slugGenerator"); // (We will create this util later)
// 1. Create Tour
const createTourIntoDB = async (payload) => {
    // Auto-generate slug if not provided
    if (!payload.slug) {
        payload.slug = (0, slugGenerator_1.generateSlug)(payload.tourTitle);
    }
    // Check for duplicate slug
    const existing = await database_1.default.tour.findUnique({ where: { slug: payload.slug } });
    if (existing) {
        throw new Error("Tour with this name already exists!");
    }
    return database_1.default.tour.create({
        data: {
            ...payload,
            availableSeats: payload.maxSeats // Initially, available = max
        }
    });
};
exports.createTourIntoDB = createTourIntoDB;
// 2. Get All Tours (Advanced Filtering)
const getAllToursFromDB = async (filters) => {
    const { searchTerm, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', minPrice, maxPrice, ...filterData } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const andConditions = [];
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
                [key]: filterData[key]
            }))
        });
    }
    // D. Execute Query
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await database_1.default.tour.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const total = await database_1.default.tour.count({ where: whereConditions });
    return {
        meta: { page, limit, total },
        data: result
    };
};
exports.getAllToursFromDB = getAllToursFromDB;
// 3. Get Single Tour
const getSingleTourFromDB = async (slug) => {
    return database_1.default.tour.findUnique({
        where: { slug }
    });
};
exports.getSingleTourFromDB = getSingleTourFromDB;
// 4. Update Tour
const updateTourInDB = async (id, payload) => {
    return database_1.default.tour.update({
        where: { tourId: id },
        data: payload
    });
};
exports.updateTourInDB = updateTourInDB;
// 5. Delete Tour
const deleteTourFromDB = async (id) => {
    return database_1.default.tour.delete({
        where: { tourId: id }
    });
};
exports.deleteTourFromDB = deleteTourFromDB;
//# sourceMappingURL=tours.service.js.map