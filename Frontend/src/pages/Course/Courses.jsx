import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BookOpen, Plus, User, Star, Clock, Play,
  Search, Filter, Grid3X3, List, ChevronRight,
  Award, Eye
} from "lucide-react";
import useEnroll from "../../hooks/useEnroll"; 
import BACK_URL from "../../api";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { enroll, isLoading: enrolling } = useEnroll({ token});

  // ✅ Fetch user + courses + enrolled
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    else{
      // fetch user info
      axios
      .get(`${BACK_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      });

    // fetch enrolled courses
    axios
      .get(`${BACK_URL}/api/enrollments/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEnrolledCourses(res.data || []);
      })
      .catch((err) => console.error("Failed to load enrollments:", err));
    }

    setLoading(true);

   // fetch all courses
    axios
      .get(`${BACK_URL}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCourses(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch courses:", err);
        alert("Unable to load courses. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // ✅ check enrolled helper
  const isEnrolled = (courseId) => {
  return enrolledCourses.some((ec) => ec.course?._id === courseId);
};



  // ✅ case-insensitive search
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">All Courses</h2>
              <p className="text-gray-600 mt-1">Discover and enroll in amazing courses</p>
            </div>
          </div>

          {user?.role === "instructor" && (
            <button
              onClick={() => navigate("/create-course")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </button>
          )}
        </div>

        {/* Search + View mode */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${
                  viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${
                  viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-600">Loading courses...</p>
          </div>
        )}

        {/* Courses */}
        {!loading && filteredCourses.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }
          >
            {filteredCourses.map((c) => {
              const alreadyEnrolled = isEnrolled(c._id);
              return (
                <div
                  key={c._id}
                  onClick={() =>
                    alreadyEnrolled
                      ? navigate(`/continue/${c._id}`)
                      : navigate(`/courses/${c._id}`)
                  }
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:scale-105 cursor-pointer ${
                    viewMode === "list" ? "flex gap-6 p-6" : ""
                  }`}
                >
                  {/* Thumbnail */}
                  <div className={`relative ${viewMode === "list" ? "w-48 h-32 flex-shrink-0" : ""}`}>
                    {c.thumbnail?.url ? (
                      <img
                        src={c.thumbnail.url}
                        alt={c.title}
                        className={`w-full object-cover ${viewMode === "list" ? "h-32 rounded-lg" : "h-48"}`}
                      />
                    ) : (
                      <div className={`bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center ${viewMode === "list" ? "h-32 rounded-lg" : "h-48"}`}>
                        <BookOpen className="w-12 h-12 text-blue-500" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {c.students || 0}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-6 flex-1 ${viewMode === "list" ? "p-0" : ""}`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xl font-bold text-gray-800 hover:text-blue-600 line-clamp-2">
                        {c.title}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-gray-100 p-1.5 rounded-full">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-gray-600">{c.instructor?.name}</span>
                    </div>

                    {/* Ratings + Duration */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{c.rating || "4.5"}</span>
                        <span className="text-sm text-gray-500">({c.students || 0})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{c.duration || "8 weeks"}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      {alreadyEnrolled ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/continue/${c._id}`);
                          }}
                          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          <Play className="w-4 h-4" /> Continue
                        </button>
                      ) : (
                        <button
                          disabled={enrolling}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (c.isFree) {
                              enroll(c._id); // free
                            } else {
                              enroll(c._id, { paid: true }); // paid → Razorpay
                            }
                          }}
                          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                        >
                          <Play className="w-4 h-4" />
                          {enrolling ? "Processing..." : "Enroll Now"}
                        </button>
                      )}

                      {/* Price */}
                      <div className="flex flex-col items-end">
                        {c.isFree ? (
                          <span className="text-lg font-bold text-green-600">Free</span>
                        ) : (
                          <>
                            <span className="text-lg font-bold text-gray-800">
                              ₹{c.discountPrice > 0 ? c.discountPrice : c.price}
                            </span>
                            {c.discountPrice > 0 && (
                              <span className="text-sm text-gray-500 line-through">₹{c.price}</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
