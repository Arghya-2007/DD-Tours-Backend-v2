import { Request, Response } from "express";
import * as blogService from "./blog.service";
import { AuthRequest } from "@common/middleware/auth.middleware";

// Create (Admin)
export const createBlog = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new Error("Unauthorized");

        const result = await blogService.createBlogIntoDB(userId, req.body);
        res.status(201).json({ success: true, message: "Blog created!", data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All (Public/Admin)
export const getAllBlogs = async (req: Request, res: Response) => {
    try {
        const result = await blogService.getAllBlogsFromDB(req.query);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single (Public)
export const getBlogBySlug = async (req: Request, res: Response) => {
    try {
        const result = await blogService.getBlogBySlugFromDB(req.params.slug);
        if (!result) return res.status(404).json({ success: false, message: "Blog not found" });
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single (Admin Edit)
export const getBlogById = async (req: Request, res: Response) => {
    try {
        const result = await blogService.getBlogByIdFromDB(req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update (Admin)
export const updateBlog = async (req: AuthRequest, res: Response) => {
    try {
        const result = await blogService.updateBlogInDB(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Blog updated", data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete (Admin)
export const deleteBlog = async (req: AuthRequest, res: Response) => {
    try {
        await blogService.deleteBlogFromDB(req.params.id);
        res.status(200).json({ success: true, message: "Blog deleted" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};