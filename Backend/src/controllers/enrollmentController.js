import Enrollment from "../models/Enrollment.model.js";
import Course from "../models/Course.model.js";
import Payment from "../models/Payment.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Enroll in course (free OR paid)
export const enrollInCourse = async (req, res) => {
    try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: "Course ID is required" });

    const course = await Course.findById(courseId).populate("instructor", "_id name");
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Prevent instructor enrolling
    if (course.instructor._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "Instructors cannot enroll in their own course" });
    }

    // Already fully enrolled?
    const existing = await Enrollment.findOne({ student: req.user._id, course: courseId, status: "enrolled" });
    if (existing) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // Free course → enroll immediately
    if (!course.discountPrice || course.discountPrice === 0) {
      const enroll = await Enrollment.create({
        student: req.user._id,
        course: courseId,
        status: "enrolled",
      });
      return res.status(201).json({ message: "Enrolled successfully", enroll });
    }

    // Check for existing cancelled enrollment
    let enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId, status: "cancelled" });

    // Paid course → create Razorpay order
    const order = await razorpay.orders.create({
      amount: course.discountPrice * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`.slice(0, 40),
    });

    const payment = await Payment.create({
      student: req.user._id,
      course: courseId,
      orderId: order.id,
      amount: course.discountPrice,
      currency: "INR",
      status: "created",
    });

    if (enrollment) {
      // 🔄 Reuse existing cancelled enrollment
      enrollment.status = "pending";
      enrollment.payment = payment._id;
      await enrollment.save();
    } else {
      // 🆕 Create new one
      enrollment = await Enrollment.create({
        student: req.user._id,
        course: courseId,
        payment: payment._id,
        status: "pending",
      });
    }

    res.status(200).json({
      message: "Payment required",
      courseId,
      price: course.discountPrice,
      orderId: order.id,
      key: process.env.RAZORPAY_KEY,
      prefill: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ message: "Server error during enrollment" });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const studentId = req.user.id; // assuming auth middleware attaches user

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment details" });
    }

    // 🔑 Step 1: Verify signature with Razorpay secret
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET) // changed from RAZORPAY_KEY_SECRET
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    // 🔎 Step 2: Find the payment record
    const payment = await Payment.findOne({ orderId: razorpay_order_id, student: studentId, course: courseId });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (isValid) {
      // ✅ Update payment record
      payment.paymentId = razorpay_payment_id;
      payment.status = "success";
      await payment.save();

      // ✅ Create / update enrollment
      let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
      if (!enrollment) {
        enrollment = new Enrollment({
          student: studentId,
          course: courseId,
          payment: payment._id,
          status: "enrolled",
        });
      } else {
        enrollment.status = "enrolled";
        enrollment.payment = payment._id;
      }
      await enrollment.save();

      return res.json({ message: "Payment verified successfully, enrolled!" });
    } else {
      // ❌ Mark payment failed
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student's enrolled courses
export const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id }).populate({
      path: "course",
      select: "title description price discountPrice instructor thumbnail",
      populate: { path: "instructor", select: "name" },
    });
    res.status(200).json(enrollments);
  } catch (err) {
    console.error("Get my courses error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark payment as failed and cancel enrollment
export const paymentFailed = async (req, res) => {
  try {
    const { orderId, courseId } = req.body;
    const studentId = req.user._id; // Assuming auth middleware attaches user

    if (!orderId || !courseId) {
      return res.status(400).json({ message: "orderId and courseId are required" });
    }

    // Find the payment record
    const payment = await Payment.findOne({ orderId, course: courseId, student: studentId });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Update payment status to 'failed'
    payment.status = "failed";
    await payment.save();

    // Find related enrollment and update to 'cancelled' if pending
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (enrollment && enrollment.status === "pending") {
      enrollment.status = "cancelled";
      await enrollment.save();
    }

    return res.json({ message: "Payment marked as failed and enrollment cancelled." });
  } catch (err) {
    console.error("paymentFailed error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

