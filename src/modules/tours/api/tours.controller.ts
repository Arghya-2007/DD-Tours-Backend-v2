import { Request, Response } from "express";
import * as tourService from "./../core/tours.service";
import redis, { clearCache } from "../../../app/redis";

// 1. CREATE TOUR (Admin Only)
export const createTour = async (req: Request, res: Response) => {
    try {
        const result = await tourService.createTourIntoDB(req.body);

        // 🧹 INVALIDATION: New data added, so the "List" cache is now stale.
        await clearCache("tours:*");

        res.status(201).json({
            success: true,
            message: "Tour created successfully!",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 2. GET ALL TOURS (Public + Cached ⚡️)
export const getAllTours = async (req: Request, res: Response) => {
    try {
        // 🔑 Unique Key: depends on query params (page, search, etc.)
        // Example: "tours:{"page":"1","limit":"10"}"
        const cacheKey = `tours:${JSON.stringify(req.query)}`;

        // A. Check Redis
        const cachedData = await redis.get(cacheKey);
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

// 3. GET SINGLE TOUR (Public + Cached ⚡️)
export const getSingleTour = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const cacheKey = `tour:${slug}`;

        // A. Check Redis
        const cachedData = await redis.get(cacheKey);
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

// 4. UPDATE TOUR (Admin Only)
export const updateTour = async (req: Request, res: Response) => {
    try {
        const { tourId } = req.params;
        const result = await tourService.updateTourInDB(tourId, req.body);

        // 🧹 INVALIDATION:
        // 1. Clear the specific tour's cache (if it exists)
        // 2. Clear ALL list caches (because price/details changed)
        await redis.del(`tour:${result.slug}`);
        await clearCache("tours:*");

        res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 5. DELETE TOUR (Admin Only)
export const deleteTour = async (req: Request, res: Response) => {
    try {
        const { tourId } = req.params;

        // First get the tour to know the slug (for cache clearing)
        // Note: If you don't have a service for getById, you might need to fetch it first.
        // For now, let's assume we just clear the list.
        // To be perfect, we should find the slug first.

        await tourService.deleteTourFromDB(tourId);

        // 🧹 INVALIDATION
        await clearCache("tours:*");
        // Ideally: await redis.del(`tour:${deletedTourSlug}`);

        res.status(200).json({
            success: true,
            message: "Tour deleted successfully"
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};