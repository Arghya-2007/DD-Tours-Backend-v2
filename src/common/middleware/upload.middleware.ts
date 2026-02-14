import multer from "multer";

// Store file in memory (RAM) temporarily
const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit: 5MB
});