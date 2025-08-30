import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  uploadCourseVideos,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadImage, uploadVideos } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Create course with image
router.post("/", protect, uploadImage.single("thumbnail"), createCourse);

// Upload multiple videos to course (only instructor)
router.post("/:id/videos", protect, uploadVideos.array("videos", 5), uploadCourseVideos);

// Update course (title/description) - only instructor
router.put("/:id", protect, updateCourse);

//Delete
router.delete("/:id", protect, deleteCourse);

// Get all courses
router.get("/", getAllCourses);

// Get single course by ObjectId (must be after other specific routes)
router.get("/:id", getCourseById);

export default router;
