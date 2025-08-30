import express from "express";
import { updateProgress, getCourseProgress } from "../controllers/progressController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Update or save progress for a video
router.post("/update", protect, updateProgress);

// ✅ Get progress for a course
router.get("/:courseId", protect, getCourseProgress);

export default router;
