import { Request, Response } from "express";
import * as tourService from "./../core/tours.service";
import  redis  from "../../../app/redis"; // Check your import path

// Helper to clear list caches
const clearListCache = async () => {
    const keys = await redis.keys("tours:*");
    if (keys.length > 0) await redis.del(keys);
};

// ==========================================
// 1. CREATE TOUR (Admin)
// ==========================================
export const createTour = async (req: Request, res: Response) => {
    try {
        // Validation happens in middleware, so we trust req.body here
        const result = await tourService.createTourIntoDB(req.body);

        // 🧹 CACHE: New data added, invalidate lists
        await clearListCache();

        res.status(201).json({
            success: true,
            message: "Tour created successfully!",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. GET ALL TOURS (Public + Filter + Cache)
// ==========================================
export const getAllTours = async (req: Request, res: Response) => {
    try {
        // Create a unique key based on ALL query params
        // e.g. "tours:page=1&limit=10&category=Adventure"
        const queryString = new URLSearchParams(req.query as any).toString();
        const cacheKey = `tours:${queryString}`;

        // A. Check Redis
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                message: "Tours fetched from Cache ⚡️",
                ...JSON.parse(cachedData)
            });
        }

        // B. Query DB (Service handles filtering)
        const result = await tourService.getAllToursFromDB(req.query);

        // C. Save to Redis (TTL: 1 Hour)
        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

        res.status(200).json({
            success: true,
            message: "Tours fetched successfully",
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. GET SINGLE TOUR BY SLUG (Public)
// ==========================================
export const getSingleTour = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const cacheKey = `tour:${slug}`;

        // A. Check Redis
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                message: "Tour fetched from Cache ⚡️",
                data: JSON.parse(cachedData)
            });
        }

        // B. Query DB
        const result = await tourService.getSingleTourFromDB(slug);

        if (!result) {
            return res.status(404).json({ success: false, message: "Tour not found" });
        }

        // C. Save to Redis
        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

        res.status(200).json({
            success: true,
            message: "Tour fetched successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. GET SINGLE TOUR BY ID (Admin)
// ==========================================
// 🆕 Needed for Edit Pages in Admin Panel
export const getTourById = async (req: Request, res: Response) => {
    try {
        const { tourId } = req.params;
        const result = await tourService.getTourByIdFromDB(tourId);

        if (!result) throw new Error("Tour not found");

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. UPDATE TOUR (Admin)
// ==========================================
export const updateTour = async (req: Request, res: Response) => {
    try {
        const { tourId } = req.params;
        const result = await tourService.updateTourInDB(tourId, req.body);

        // 🧹 CACHE INVALIDATION
        // 1. Clear this specific tour's slug cache
        if(result.slug) await redis.del(`tour:${result.slug}`);
        // 2. Clear all list pages (price/details changed)
        await clearListCache();

        res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 6. DELETE TOUR (Admin)
// ==========================================
export const deleteTour = async (req: Request, res: Response) => {
    try {
        const { tourId } = req.params;

        // 🔍 Step 1: Find the tour first (We need the SLUG to clear cache)
        const tour = await tourService.getTourByIdFromDB(tourId);

        if (!tour) {
            return res.status(404).json({ success: false, message: "Tour not found" });
        }

        // 🗑️ Step 2: Delete from DB
        await tourService.deleteTourFromDB(tourId);

        // 🧹 Step 3: Clear Caches
        await redis.del(`tour:${tour.slug}`); // Clear specific
        await clearListCache(); // Clear lists

        res.status(200).json({
            success: true,
            message: "Tour deleted successfully"
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 7. GET TOUR STATS (Admin Dashboard)
// ==========================================
// 🆕 Aggregation: "Avg Price", "Total Tours by Category"
export const getTourStats = async (req: Request, res: Response) => {
    try {
        const stats = await tourService.getTourStatsFromDB();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};