import { Router } from "express";
import {
  uploadFile,
} from "../controller/fileController.js";
import { authenticateToken } from "../middleware/auth.js";
import { rateLimiter } from "../middleware/rateLimit.js";
const router = Router();

router.post("/upload-file", authenticateToken, rateLimiter(5, 60), uploadFile);

export default router;
