import { Router } from "express";
import { upload } from "@common/middleware/upload.middleware";
import { authenticate } from "@common/middleware/auth.middleware";
import {uploadFiles} from "@modules/upload/upload.controller";

const router = Router();

// 🔒 Only logged-in users can upload
// 'image' is the key name you must use in Postman
router.post("/", authenticate, upload.array("images", 10), uploadFiles);

export default router;