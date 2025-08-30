import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ========== Signup ==========
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========== Login ==========
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========== Logout ==========
export const logout = async (req, res) => {
  try {
    // Since JWT is stateless, logout is usually frontend-based.
    // Here we just respond success. (Optionally, use a blacklist DB for tokens)
    res.json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========== Get Profile ==========
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });   // ✅ always wrap in { user: ... }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ========== Update User ==========
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ message: "User updated successfully", updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========== Delete User ==========
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
