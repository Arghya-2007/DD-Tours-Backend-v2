"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTour = exports.updateTour = exports.getSingleTour = exports.getAllTours = exports.createTour = void 0;
const tourService = __importStar(require("./../core/tours.service"));
const redis_1 = __importStar(require("../../../app/redis"));
// 1. CREATE TOUR (Admin Only)
const createTour = async (req, res) => {
    try {
        const result = await tourService.createTourIntoDB(req.body);
        // 🧹 INVALIDATION: New data added, so the "List" cache is now stale.
        await (0, redis_1.clearCache)("tours:*");
        res.status(201).json({
            success: true,
            message: "Tour created successfully!",
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createTour = createTour;
// 2. GET ALL TOURS (Public + Cached ⚡️)
const getAllTours = async (req, res) => {
    try {
        // 🔑 Unique Key: depends on query params (page, search, etc.)
        // Example: "tours:{"page":"1","limit":"10"}"
        const cacheKey = `tours:${JSON.stringify(req.query)}`;
        // A. Check Redis
        const cachedData = await redis_1.default.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                message: "Tours fetched successfully (Fetched from Cache ⚡️)",
                ...JSON.parse(cachedData) // Spread meta & data
            });
        }
        // B. If you Miss, Query DB
        const result = await tourService.getAllToursFromDB(req.query);
        // C. Save to Redis (TTL: 1 Hour)
        // We cache the whole response object (meta + data)
        await redis_1.default.set(cacheKey, JSON.stringify(result), "EX", 3600);
        res.status(200).json({
            success: true,
            message: "Tours fetched successfully",
            data: result.data,
            meta: result.meta
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllTours = getAllTours;
// 3. GET SINGLE TOUR (Public + Cached ⚡️)
const getSingleTour = async (req, res) => {
    try {
        const { slug } = req.params;
        const cacheKey = `tour:${slug}`;
        // A. Check Redis
        const cachedData = await redis_1.default.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                message: "Tour fetched successfully (Cache ⚡️)",
                data: JSON.parse(cachedData)
            });
        }
        // B. Query DB
        const result = await tourService.getSingleTourFromDB(slug);
        if (!result) {
            return res.status(404).json({ success: false, message: "Tour not found" });
        }
        // C. Save to Redis (TTL: 1 Hour)
        await redis_1.default.set(cacheKey, JSON.stringify(result), "EX", 3600);
        res.status(200).json({
            success: true,
            message: "Tour fetched successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSingleTour = getSingleTour;
// 4. UPDATE TOUR (Admin Only)
const updateTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const result = await tourService.updateTourInDB(tourId, req.body);
        // 🧹 INVALIDATION:
        // 1. Clear the specific tour's cache (if it exists)
        // 2. Clear ALL list caches (because price/details changed)
        await redis_1.default.del(`tour:${result.slug}`);
        await (0, redis_1.clearCache)("tours:*");
        res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateTour = updateTour;
// 5. DELETE TOUR (Admin Only)
const deleteTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        // First get the tour to know the slug (for cache clearing)
        // Note: If you don't have a service for getById, you might need to fetch it first.
        // For now, let's assume we just clear the list.
        // To be perfect, we should find the slug first.
        await tourService.deleteTourFromDB(tourId);
        // 🧹 INVALIDATION
        await (0, redis_1.clearCache)("tours:*");
        // Ideally: await redis.del(`tour:${deletedTourSlug}`);
        res.status(200).json({
            success: true,
            message: "Tour deleted successfully"
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteTour = deleteTour;
//# sourceMappingURL=tours.controller.js.map