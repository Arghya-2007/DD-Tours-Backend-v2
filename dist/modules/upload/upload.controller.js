"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = void 0;
const upload_service_1 = require("./upload.service");
const uploadFiles = async (req, res) => {
    try {
        // req.files contains an array of files
        // We cast it to Express.Multer.File[] to make TypeScript happy
        const files = req.files;
        if (!files || files.length === 0) {
            throw new Error("No files uploaded!");
        }
        // ⚡️ PARALLEL UPLOAD: map() creates an array of promises
        const uploadPromises = files.map(file => (0, upload_service_1.uploadToCloudinary)(file));
        // Promise.all() waits for ALL uploads to finish
        const imageUrls = await Promise.all(uploadPromises);
        res.status(200).json({
            success: true,
            message: "Images uploaded successfully",
            data: {
                urls: imageUrls // Returns an array of strings
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadFiles = uploadFiles;
//# sourceMappingURL=upload.controller.js.map