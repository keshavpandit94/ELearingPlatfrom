import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  Edit3,
  User,
  Play,
  Clock,
  Users,
  Star,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Share2,
  Heart,
  Globe,
  Target,
  Video,
  PlayCircle,
} from "lucide-react";
import EnrollButton from "../../components/EnrollButton";
import useEnroll from "../../hooks/useEnroll"; // ✅ new reusable hook
import BACK_URL from "../../api";

export default function CourseDetails() {
  const { id } = useParams(); // course ID from URL
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  // ✅ use reusable hook
  const { isEnrolled, enroll, refreshEnrollment } = useEnroll({id});

  // console.log(isEnrolled)

  useEffect(() => {
    if (!token) {
      setUser(null);
    } else {
      // ✅ Get logged-in user
      axios
        .get(`${BACK_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        });
    }

    // ✅ Fetch course details
    axios
      .get(`${BACK_URL}/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCourse(res.data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to fetch course details.");
        navigate("/courses");
      })
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <button
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              onClick={() => navigate("/courses")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>
            <span>/</span>
            <span className="text-gray-800">Course Details</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-800 mb-3">
                    {course.title}
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-600">
                    ({(course.students ?? 0).toLocaleString()} students)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="w-5 h-5" />
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-5 h-5" />
                  <span>{course.language}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Your Instructor
                </h3>
                <div className="flex items-center gap-4">
                  {course.instructor?.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {course.instructor?.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {course.instructor?.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Thumbnail */}
              {course.thumbnail?.url && (
                <div className="mb-8">
                  <img
                    src={course.thumbnail.url}
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* Right Column - Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 sticky top-8">
                <div className="text-center mb-6 flex flex-col">
                  {course.isFree ? (
                    <span className="text-lg font-bold text-green-600">
                      Free
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-800 mb-2">
                        ₹
                        {course.discountPrice > 0
                          ? course.discountPrice
                          : course.price}
                      </span>
                      {course.discountPrice > 0 && (
                        <span className="text-xl text-gray-500 line-through">
                          ₹{course.price}
                        </span>
                      )}
                    </>
                  )}
                  <p className="text-gray-600">One-time payment</p>
                </div>

                <EnrollButton
                  course={course}
                  isEnrolled={isEnrolled}
                  enroll={enroll}
                  token={token}
                  user={user}
                  refreshEnrollment={refreshEnrollment}
                />

                <div className="flex gap-2 mb-6">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4" />
                    Save
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* Edit button for course owner */}
                {user?.role === "instructor" &&
                  user?._id === course.instructor?._id && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-course/${course._id}`);
                        }}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 mb-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-300 shadow-md`}
                      >
                        <Edit3 size={18} />
                        Edit Course
                      </button>
                    </div>
                  )}

                {/* Course Features */}
                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-gray-800">
                    This course includes:
                  </h4>
                  {(course.features ?? []).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Course Info */}
                <div className="border-t border-gray-200 pt-4 mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Students enrolled</span>
                    <span className="font-medium">
                      {(course.students ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last updated</span>
                    <span className="font-medium">{course.lastUpdated}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      {course.videos?.length > 0 && (
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Video className="w-6 h-6 text-blue-600" />
                Course Content
              </h3>
              <p className="text-gray-600">
                {course.videos.length} lessons • {course.duration} total duration
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Video List */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Course Lessons
                  </h4>
                  <div className="space-y-2">
                    {course.videos.map((video, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveVideo(index)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          activeVideo === index
                            ? "bg-blue-100 border-2 border-blue-300"
                            : "bg-white hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              activeVideo === index
                                ? "bg-blue-600"
                                : "bg-gray-300"
                            }`}
                          >
                            <PlayCircle
                              className={`w-4 h-4 ${
                                activeVideo === index
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate text-sm">
                              {index + 1}. {video.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {video.duration}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div className="lg:col-span-2">
                <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    {isEnrolled ? (
                      <video
                        controls
                        src={course.videos[activeVideo]?.url}
                        className="w-full h-full"
                        poster={course.thumbnail?.url}
                      />
                    ) : (
                      <div className="text-center text-white p-8">
                        <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Play className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2">
                          Preview Available
                        </h4>
                        <p className="text-gray-300 mb-4">
                          Enroll to access all course content
                        </p>
                        <button
                          onClick={enroll}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <Play className="w-4 h-4" />
                          Enroll Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Video Info */}
                <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Lesson {activeVideo + 1}: {course.videos[activeVideo]?.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.videos[activeVideo]?.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {(course.students ?? 0).toLocaleString()} students
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
