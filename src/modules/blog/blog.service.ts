import prisma from "../../app/database";
import { Prisma } from "@prisma/client";

// Helper: Slug Generator
const generateSlug = (title: string) => {
    return title.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// 1. CREATE BLOG
export const createBlogIntoDB = async (userId: string, payload: any) => {
    let slug = payload.slug || generateSlug(payload.title);

    // Ensure unique slug
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    return prisma.blog.create({
        data: {
            ...payload,
            slug,
            authorId: userId,
            // Ensure array fields are arrays
            tags: Array.isArray(payload.tags) ? payload.tags : [],
            images: Array.isArray(payload.images) ? payload.images : [],
            youtubeUrl: payload.youtubeUrl || null,
            facebookUrl: payload.facebookUrl || null,
        }
    });
};

// 2. GET ALL BLOGS (With Search & Filter)
export const getAllBlogsFromDB = async (query: any) => {
    const { page = 1, limit = 10, search, category, isPublished } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.BlogWhereInput = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (category && category !== 'ALL') {
        where.category = category;
    }

    // Convert string "true"/"false" to boolean if needed
    if (isPublished !== undefined) {
        where.isPublished = isPublished === 'true';
    }

    const blogs = await prisma.blog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { userName: true, userEmail: true } } }
    });

    const total = await prisma.blog.count({ where });

    return { meta: { page, limit, total }, data: blogs };
};

// 3. GET SINGLE BLOG (By Slug)
export const getBlogBySlugFromDB = async (slug: string) => {
    // Increment view count
    await prisma.blog.update({
        where: { slug },
        data: { views: { increment: 1 } }
    });

    return prisma.blog.findUnique({
        where: { slug },
        include: { author: { select: { userName: true } } }
    });
};

// 4. GET SINGLE BLOG (By ID - For Admin Edit)
export const getBlogByIdFromDB = async (id: string) => {
    return prisma.blog.findUnique({ where: { id } });
};

// 5. UPDATE BLOG
export const updateBlogInDB = async (id: string, payload: any) => {
    return prisma.blog.update({
        where: { id },
        data: {
            ...payload,
            youtubeUrl: payload.youtubeUrl || null,
            facebookUrl: payload.facebookUrl || null,
        }
    });
};

// 6. DELETE BLOG
export const deleteBlogFromDB = async (id: string) => {
    return prisma.blog.delete({ where: { id } });
};