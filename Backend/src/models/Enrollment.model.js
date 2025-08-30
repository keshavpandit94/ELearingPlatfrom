import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment", // link to payment record
      default: null,
    },
    status: {
      type: String,
      enum: ["enrolled", "pending", "cancelled"],
      default: "pending", // when payment is not completed yet
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure one student cannot enroll twice in the same course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
