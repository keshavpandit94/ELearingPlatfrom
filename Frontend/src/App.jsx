import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/User/Login";
import Signup from "./pages/User/Signup";
import Courses from "./pages/Course/Courses";
import CourseDetails from "./pages/Course/CourseDetails";
import MyCourses from "./pages/User/MyCourses";
import CreateCourse from "./pages/Course/CreateCourse";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/User/Profile";
import EditCourse from "./pages/Course/EditCourse";
import ContinueLearning from "./pages/User/ContinueLearning";
import CoursePlayer from "./pages/User/CoursePlayer";

function App() {
  const token = localStorage.getItem("token")
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-courses" element={<CreateCourse />} />
          <Route path="/edit-course/:id" element={<EditCourse />} />
          {/* <Route path="/continue/:courseId" element={<ContinueLearning />} /> */}
          <Route path="/continue/:courseId" element={<CoursePlayer token={token} />} />


          {/* ✅ Protected Routes */}
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-course"
            element={
              <ProtectedRoute>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
