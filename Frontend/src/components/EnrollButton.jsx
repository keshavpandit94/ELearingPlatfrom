import { CheckCircle, Play } from "lucide-react";
import useEnroll from "../hooks/useEnroll.js";
import axios from "axios";

export default function EnrollButton({ course, token, user,  }) {
  const { enroll, isEnrolled, loading } = useEnroll({ token, user, courseId: course._id });

  // console.log(token)
  // console.log(user)
    // console.log(isEnrolled)

  // const checkEnrolled = () => {
  //   axios.get()
  //   .then()
  //   .catch()

  // }
  return (
    <button
      onClick={() => enroll(course)}
      disabled={isEnrolled || loading}
      className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all duration-200 mb-4 ${
        isEnrolled
          ? "bg-green-100 text-green-700 cursor-default"
          : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105 shadow-lg"
      }`}
    >
      {isEnrolled ? (
        <>
          <CheckCircle className="w-5 h-5" />
          Enrolled
        </>
      ) : (
        <>
          <Play className="w-5 h-5" />
          {loading ? "Processing..." : "Enroll Now"}
        </>
      )}
    </button>
  );
}
