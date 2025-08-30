import mongoose from "mongoose";
import Progress from "../models/Progress.model.js";
import Course from "../models/Course.model.js";

/**
 * Update or save video progress
 * Returns full course progress including last watched video
 */
export const updateProgress = async (req, res) => {
  try {
    const { courseId, videoId, progress = 0, lastTimestamp = 0 } = req.body;
    const studentId = req.user?.id;

    if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!courseId || !videoId)
      return res.status(400).json({ success: false, message: "Missing courseId or videoId" });
    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(videoId))
      return res.status(400).json({ success: false, message: "Invalid courseId or videoId" });

    const safeProgress = Math.min(Math.max(Number(progress), 0), 100);
    const safeTimestamp = Math.max(Number(lastTimestamp), 0);

    // Fetch course
    const course = await Course.findById(courseId).select("videos title");
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // Fetch or create progress document
    let progressDoc = await Progress.findOne({ student: studentId, course: courseId });
    if (!progressDoc) progressDoc = new Progress({ student: studentId, course: courseId, videos: [], lastVideo: {} });

    // Update or add video progress
    const existingVideo = progressDoc.videos.find(v => v.videoId.toString() === videoId.toString());
    if (existingVideo) {
      existingVideo.progress = safeProgress;
      existingVideo.lastTimestamp = safeTimestamp;
      existingVideo.completed = safeProgress >= 90;
      existingVideo.updatedAt = new Date();
    } else {
      progressDoc.videos.push({
        videoId,
        progress: safeProgress,
        lastTimestamp: safeTimestamp,
        completed: safeProgress >= 90,
        updatedAt: new Date(),
      });
    }

    // Update last watched video
    progressDoc.lastVideo = { videoId, lastTimestamp: safeTimestamp };

    await progressDoc.save();

    // Prepare full course progress response
    const videos = course.videos.map(vid => {
      const record = progressDoc.videos.find(v => v.videoId.toString() === vid._id.toString());
      return {
        _id: vid._id,
        title: vid.title,
        url: vid.url,
        progress: record?.progress || 0,
        lastTimestamp: record?.lastTimestamp || 0,
        completed: record?.completed || false,
        updatedAt: record?.updatedAt || null,
      };
    });

    const completedVideos = videos.filter(v => v.completed).length;
    const courseCompleted = videos.length > 0 && completedVideos === videos.length;

    const lastVidRecord = progressDoc.videos.find(v => v.videoId.toString() === progressDoc.lastVideo.videoId.toString());
    const lastVideo = lastVidRecord
      ? {
          _id: lastVidRecord.videoId,
          progress: lastVidRecord.progress,
          lastTimestamp: lastVidRecord.lastTimestamp,
          completed: lastVidRecord.completed,
        }
      : null;

    res.json({ success: true, videos, courseCompleted, lastVideo });
  } catch (err) {
    console.error("Update progress error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get course progress for a student
 */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.id;

    if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(courseId))
      return res.status(400).json({ success: false, message: "Invalid courseId" });

    const course = await Course.findById(courseId).select("videos title");
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const progressDoc = await Progress.findOne({ student: studentId, course: courseId });

    const videos = course.videos.map(vid => {
      const record = progressDoc?.videos.find(v => v.videoId.toString() === vid._id.toString());
      return {
        _id: vid._id,
        title: vid.title,
        url: vid.url,
        progress: record?.progress || 0,
        lastTimestamp: record?.lastTimestamp || 0,
        completed: record?.completed || false,
        updatedAt: record?.updatedAt || null,
      };
    });

    const completedVideos = videos.filter(v => v.completed).length;
    const courseCompleted = videos.length > 0 && completedVideos === videos.length;

    const lastVidRecord = progressDoc?.videos.find(v => v.videoId.toString() === progressDoc?.lastVideo?.videoId?.toString());
    const lastVideo = lastVidRecord
      ? {
          _id: lastVidRecord.videoId,
          progress: lastVidRecord.progress,
          lastTimestamp: lastVidRecord.lastTimestamp,
          completed: lastVidRecord.completed,
        }
      : null;

    res.json({ success: true, videos, courseCompleted, lastVideo });
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch progress" });
  }
};
