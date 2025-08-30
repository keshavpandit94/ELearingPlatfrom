import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import BACK_URL from "../api";

export default function useEnroll({ token, user, courseId }) {
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
    // const token2 = localStorage.getItem("token");
    // console.log(token2)
    // console.log(token) //okay
    // console.log(user) //okay
    // console.log(courseId) // okay data fetch 
  // 🔹 Reusable enrollment check function
  const checkEnrollment = useCallback(async () => {
    if (!token || !courseId) return;
    try {
      const res = await axios.get(`${BACK_URL}/api/enrollments/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(res.data[0].course)
      const enrolledCourses = res.data[0]?.course || [];
      if (enrolledCourses._id === courseId) setIsEnrolled(true)
    } catch (err) {
      console.error("Enrollment check failed:", err);
    }
  }, [token, courseId]);

  // console.log(isEnrolled)
  // 🔹 Run check on mount & whenever course/token changes
  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  const enroll = async (course) => {
    if (!token) {
      alert("Please login to enroll.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Attempt enrollment
      const res = await axios.post(
        "/api/enrollments",
        { courseId: course._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      // console.log(data)

      // Free course → directly enrolled
      if (data.message === "Enrolled successfully") {
        alert("✅ Enrolled in free course!");
        await checkEnrollment(); // refresh enrollment
        setLoading(false);
        return;
      }

      // Paid course → Razorpay
      if (data.message === "Payment required") {
        const { orderId, amount, currency, key } = data;

        const options = {
          key,
          amount,
          currency,
          name: "E-Learning Platform",
          description: `Payment for ${course.title}`,
          order_id: orderId,
          handler: async (response) => {
            try {
              const verifyRes = await axios.post(
                `${BACK_URL}/api/enrollments/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  courseId: course._id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyRes.data.message.includes("success")) {
                alert("✅ Payment successful, enrolled!");
                await checkEnrollment(); // 🔄 auto-refresh enrollment
              } else {
                alert("⚠️ Payment verification failed!");
              }
            } catch (err) {
              alert("❌ Verification failed.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name || "Student User",
            email: user?.email || "student@example.com",
          },
          theme: { color: "#3399cc" },
        };

        // Ensure Razorpay script loaded
        if (!window.Razorpay) {
          await loadRazorpayScript();
        }

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("❌ Something went wrong.");
      setLoading(false);
    }
  };

  return { enroll, isEnrolled, loading, checkEnrollment };
}

// Utility loader
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
