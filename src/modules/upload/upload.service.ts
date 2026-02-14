import cloudinary from "../../config/cloudinary.config";
import { Express } from 'express';

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "dd-tours", // Folder name in Cloudinary
                resource_type: "auto"
            },
            (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result.secure_url); // We only need the URL
            }
        );

        // Write buffer to stream
        uploadStream.end(file.buffer);
    });
};