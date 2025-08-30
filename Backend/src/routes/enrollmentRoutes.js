import express from 'express';
import { enrollInCourse, getMyCourses, verifyPayment } from '../controllers/enrollmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/', protect, enrollInCourse);
router.post("/verify", protect, verifyPayment);
router.get('/my-courses', protect, getMyCourses);

export default router;
