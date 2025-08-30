import Course from "../models/Course.model.js";
import mongoose from "mongoose";

// Create course with thumbnail
export const createCourse = async (req, res) => {
  try {
    const { title, description, duration, price, discountPrice, isFree } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    let finalPrice = price;
    let finalDiscount = discountPrice;

    // If course is free, override price & discount
    if (isFree === "true" || isFree === true) {
      finalPrice = 0;
      finalDiscount = 0;
    }

    const course = await Course.create({
      title,
      description,
      duration,
      price: finalPrice,
      discountPrice: finalDiscount || 0,
      isFree: isFree || false,
      instructor: req.user._id,
      thumbnail: {
        public_id: req.file.filename,
        url: req.file.path,
      },
      videos: [],
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload multiple videos (only instructor)
export const uploadCourseVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const { titles } = req.body; // Expect titles as array of strings

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to upload videos" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No videos uploaded" });
    }

    req.files.forEach((file, idx) => {
      course.videos.push({
        title: Array.isArray(titles) ? titles[idx] : titles,
        public_id: file.filename,
        url: file.path,
      });
    });

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course details (only instructor)
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, price, discountPrice, isFree } = req.body;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this course" });
    }

    if (title) course.title = title;
    if (description) course.description = description;
    if (duration) course.duration = duration;

    if (isFree === "true" || isFree === true) {
      course.isFree = true;
      course.price = 0;
      course.discountPrice = 0;
    } else {
      if (price !== undefined) course.price = price;
      if (discountPrice !== undefined) course.discountPrice = discountPrice;
      if (isFree !== undefined) course.isFree = isFree;
    }

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single course
export const getCourseById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    const course = await Course.findById(req.params.id).populate("instructor", "name");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete course (only instructor)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
