import {
  GraduationCap,
  UserPlus,
  LogIn,
  BookOpen,
  Play,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // Add this line

  // Fetch User, Courses, Features
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          // console.log(res.data)
          setUser(res.data.user)
        })
        .catch((err) => console.error("Error fetching user:", err));
    }

    axios.get("/api/courses")
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Error fetching courses:", err));

    // axios.get("/api/features")
    //   .then((res) => setFeatures(res.data))
    //   .catch((err) => console.error("Error fetching features:", err));
  }, []);

  const CourseDetailsHandler = (courseId) => {
    navigate(`/courses/${courseId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-12 h-12 text-blue-600" />
          </div>

          {/* 👤 Show logged-in user */}
          {user ? (
            <h2 className="text-xl text-gray-700 mb-4">
              Welcome back, <span className="font-bold text-blue-600">{user.name}</span> 👋
            </h2>
          ) : null}

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Welcome to
            <span className="text-blue-600 block mt-2">E-Learning Platform</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Unlock your potential with world-class courses. Learn anything, anytime, from anywhere with expert instructors and interactive content.
          </p>

          {/* CTA Buttons */}
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate("/signup")}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-3 px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:text-green-600 transition-all duration-200 font-semibold shadow-md"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            </div>
          )}

          {/* Features Section */}
          {/* <div className="grid md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-4 mx-auto">
                  <span className="text-2xl">{feature.icon || "✨"}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Featured Courses */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Featured Courses</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular courses designed by industry experts to help you master in-demand skills.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {/* <div className="bg-gray-50 p-3 rounded-lg"> */}
                      {/* <span className="text-2xl">{course.thumb || "📘"}</span> */}
                      <div className="relative">
                        {course.thumbnail?.url ? (
                          <img
                            src={course.thumbnail.url}
                            alt={course.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center h-48">
                            <BookOpen className="w-12 h-12 text-blue-500" />
                          </div>
                        )}
                      </div>
                      {/* <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{course.rating || "4.5"}</span>
                      </div> */}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{course.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students || "0"} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration || "N/A"}</span>
                      </div>
                    </div>

                    <button 
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium group-hover:shadow-lg"
                      onClick={() => CourseDetailsHandler(course._id)}
                    >
                      <Play className="w-4 h-4" />
                      Start Learning
                    </button>
                  </div>
                </div>
            ))}
              </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Join thousands of students already learning with our platform. Start your journey today!
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Join Now - It's Free!
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
