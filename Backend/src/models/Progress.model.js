import mongoose from "mongoose";

const videoProgressSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, required: true },
  progress: { type: Number, default: 0 },
  lastTimestamp: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

const progressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    videos: [videoProgressSchema], // array of video progress
    lastVideo: { 
      videoId: { type: mongoose.Schema.Types.ObjectId },
      lastTimestamp: { type: Number, default: 0 }
    },
  },
  { timestamps: true }
);

// Ensure one document per student per course
progressSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
