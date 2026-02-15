import { Router } from "express";
import {
    createBlog, getAllBlogs, getBlogBySlug,
    getBlogById, updateBlog, deleteBlog
} from "./blog.controller";
import { authenticate, requireAdmin } from "@common/middleware/auth.middleware";

const router = Router();

// Public
router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);

// Admin
router.get("/id/:id", authenticate, requireAdmin, getBlogById); // For Edit
router.post("/", authenticate, requireAdmin, createBlog);
router.patch("/:id", authenticate, requireAdmin, updateBlog);
router.delete("/:id", authenticate, requireAdmin, deleteBlog);

export default router;