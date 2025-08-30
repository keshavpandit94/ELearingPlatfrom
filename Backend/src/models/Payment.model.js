import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      required: true 
    },
    orderId: { 
      type: String, 
      required: true 
    }, // Razorpay order ID
    paymentId: { 
      type: String 
    }, // Razorpay payment ID (after success)
    amount: { 
      type: Number, 
      required: true 
    }, // in paise
    currency: { 
      type: String, 
      default: "INR" 
    },
    status: { 
      type: String, 
      enum: ["created", "success", "failed"], 
      default: "created" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
