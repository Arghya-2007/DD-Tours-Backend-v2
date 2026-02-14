import { Request, Response } from "express";
import { uploadToCloudinary } from "./upload.service";

export const uploadFiles = async (req: Request, res: Response) => {
    try {
        // req.files contains an array of files
        // We cast it to Express.Multer.File[] to make TypeScript happy
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            throw new Error("No files uploaded!");
        }

        // ⚡️ PARALLEL UPLOAD: map() creates an array of promises
        const uploadPromises = files.map(file => uploadToCloudinary(file));

        // Promise.all() waits for ALL uploads to finish
        const imageUrls = await Promise.all(uploadPromises);

        res.status(200).json({
            success: true,
            message: "Images uploaded successfully",
            data: {
                urls: imageUrls // Returns an array of strings
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};