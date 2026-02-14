"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_config_1 = __importDefault(require("../../config/cloudinary.config"));
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_config_1.default.uploader.upload_stream({
            folder: "dd-tours", // Folder name in Cloudinary
            resource_type: "auto"
        }, (error, result) => {
            if (error)
                return reject(error);
            if (result)
                return resolve(result.secure_url); // We only need the URL
        });
        // Write buffer to stream
        uploadStream.end(file.buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
//# sourceMappingURL=upload.service.js.map