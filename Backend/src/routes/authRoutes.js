import express from "express";
import {
  signup,
  login,
  logout,
  getProfile,
  updateUser,
  deleteUser,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.post("/signup", signup);
router.post("/login", login);

// Protected
router.post("/logout", protect, logout);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateUser);
router.delete("/me", protect, deleteUser);

export default router;
