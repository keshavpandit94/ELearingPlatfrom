import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ⬅ added useLocation
import axios from "axios";
import {
  GraduationCap,
  BookOpen,
  Library,
  Plus,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  Home,
  User,
} from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation(); // ⬅ detect active route
  const token = localStorage.getItem("token");

  const profileRef = useRef(null);

  // Fetch user profile
  useEffect(() => {
    if (token) {
      axios
        .get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, [token]);

  // Close profile dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // hover open menu
  const handleMouseEnter = () => setIsMenuOpen(true);
  const handleMouseLeave = () => setIsMenuOpen(false);

  // active link style
  const linkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg ${
      location.pathname === path
        ? "text-blue-600 bg-blue-50 font-semibold"
        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
    }`;

  return (
    <nav
      className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            E-Learning
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={linkClass("/")}>
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link to="/courses" className={linkClass("/courses")}>
              <BookOpen className="w-4 h-4" /> Courses
            </Link>

            {token && (
              <>
                <Link to="/my-courses" className={linkClass("/my-courses")}>
                  <Library className="w-4 h-4" /> My Courses
                </Link>
                {user?.role === "instructor" && (
                  <Link
                    to="/create-course"
                    className={linkClass("/create-course")}
                  >
                    <Plus className="w-4 h-4" /> Create Course
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className={linkClass("/login")}
                >
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" /> Sign Up
                </Link>
              </>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || "User"}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link to="/profile" className={linkClass("/profile")}>
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link to="/my-courses" className={linkClass("/my-courses")}>
                      <BookOpen className="w-4 h-4" /> My Learning
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link to="/" className={linkClass("/")}>
                <Home className="w-5 h-5" /> Home
              </Link>
              <Link to="/courses" className={linkClass("/courses")}>
                <BookOpen className="w-5 h-5" /> Courses
              </Link>

              {token && (
                <>
                  <Link to="/my-courses" className={linkClass("/my-courses")}>
                    <Library className="w-5 h-5" /> My Courses
                  </Link>
                  {user?.role === "instructor" && (
                    <Link
                      to="/create-course"
                      className={linkClass("/create-course")}
                    >
                      <Plus className="w-5 h-5" /> Create Course
                    </Link>
                  )}
                </>
              )}

              <hr className="my-2" />
              {!token ? (
                <>
                  <Link to="/login" className={linkClass("/login")}>
                    <LogIn className="w-5 h-5" /> Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <UserPlus className="w-5 h-5" /> Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className={linkClass("/profile")}>
                    <User className="w-5 h-5" /> Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
