import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BookOpen, 
  FileText, 
  Image, 
  Video, 
  Plus, 
  Upload,
  CheckCircle,
  X,
  AlertCircle,
  DollarSign,
  Clock,
  Tag,
  IndianRupee
} from "lucide-react";
import BACK_URL from "../../api";

export default function CreateCourse() {
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    duration: "", 
    price: "", 
    discountPrice: "", 
    isFree: false, 
    thumbnail: null 
  });
  const [videoFiles, setVideoFiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    axios.get(`${BACK_URL}/api/courses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleThumbnail = (e) => setForm({ ...form, thumbnail: e.target.files[0] });
  const handleVideos = (e) => setVideoFiles([...e.target.files]);
  const removeThumbnail = () => setForm({ ...form, thumbnail: null });
  const removeVideo = (index) => setVideoFiles(videoFiles.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.duration || !form.thumbnail) {
      return alert("Please fill all required fields.");
    }

    setLoading(true);
    try {
      // Create course
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("duration", form.duration);
      formData.append("price", form.price || 0);
      formData.append("discountPrice", form.discountPrice || 0);
      formData.append("isFree", form.isFree);
      formData.append("thumbnail", form.thumbnail);

      const courseRes = await axios.post(`${BACK_URL}/api/courses`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      const courseId = courseRes.data.course?._id || courseRes.data._id;

      // Upload videos separately if any
      if (videoFiles.length > 0) {
        const videoData = new FormData();
        videoFiles.forEach(file => videoData.append("videos", file));
        const titles = videoFiles.map(file => file.name);
        videoData.append("titles", JSON.stringify(titles));

        await axios.post(`${BACK_URL}/api/courses/${courseId}/videos`, videoData, {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        });
      }

      alert("Course created successfully!");
      setForm({ title: "", description: "", duration: "", price: "", discountPrice: "", isFree: false, thumbnail: null });
      setVideoFiles([]);
      fetchCourses(); // Refresh courses list
    } catch (err) {
      console.error(err);
      alert("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Create New Course</h2>
                <p className="text-blue-100 mt-1">Share your knowledge with the world</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Title & Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Course Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter an engaging course title"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-green-600" /> Course Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32"
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 text-indigo-600" /> Duration
              </label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 10 hours, 6 weeks"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <IndianRupee className="w-4 h-4 text-yellow-600" /> Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 499"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={form.isFree}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4 text-pink-600" /> Discount Price
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  value={form.discountPrice}
                  onChange={handleChange}
                  placeholder="e.g. 299"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={form.isFree}
                />
              </div>
            </div>

            {/* Free checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFree"
                checked={form.isFree}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-gray-700">This is a free course</label>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Image className="w-4 h-4 text-purple-600" /> Course Thumbnail
              </label>
              {!form.thumbnail ? (
                <div className="border-2 border-dashed p-6 text-center rounded-lg">
                  <input type="file" accept="image/*" onChange={handleThumbnail} className="hidden" id="thumbnail-upload" required />
                  <label htmlFor="thumbnail-upload" className="cursor-pointer">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">Click to upload thumbnail</p>
                  </label>
                </div>
              ) : (
                <div className="bg-green-50 border rounded-lg p-4 flex justify-between items-center">
                  <span className="flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-green-600" /> {form.thumbnail.name}
                  </span>
                  <button type="button" onClick={removeThumbnail} className="text-red-500"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {/* Videos */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Video className="w-4 h-4 text-red-600" /> Course Videos <span className="text-xs text-gray-500 ml-2">(Optional)</span>
              </label>
              <div className="border-2 border-dashed p-6 rounded-lg text-center">
                <input type="file" accept="video/*" multiple onChange={handleVideos} className="hidden" id="video-upload" />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Click to upload videos</p>
                </label>
              </div>

              {videoFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium text-gray-700">Selected Videos:</p>
                  {videoFiles.map((file, index) => (
                    <div key={index} className="bg-blue-50 border rounded-lg p-3 flex justify-between items-center">
                      <span className="flex items-center gap-2 text-blue-700 font-medium">
                        <Video className="w-4 h-4 text-blue-600" /> {file.name}
                      </span>
                      <button type="button" onClick={() => removeVideo(index)} className="text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50"
            >
              <Plus className="w-5 h-5" /> {loading ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>

        {/* Display All Courses */}
        {courses.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">All Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map(course => (
                <div key={course._id} className="border p-4 rounded shadow hover:shadow-lg transition cursor-pointer">
                  <img src={course.thumbnail?.url} alt={course.title} className="h-40 w-full object-cover rounded mb-2"/>
                  <h4 className="font-bold text-lg">{course.title}</h4>
                  <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                  <p className="text-gray-500 text-sm mt-1">Duration: {course.duration}</p>
                  {course.isFree ? (
                    <p className="text-green-600 font-semibold mt-1">Free</p>
                  ) : (
                    <p className="text-gray-800 mt-1">
                      {course.discountPrice > 0 
                        ? <>₹{course.discountPrice} <span className="line-through text-gray-400">₹{course.price}</span></> 
                        : <>₹{course.price}</>
                      }
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">Instructor: {course.instructor?.name}</p>
                  <p className="text-gray-500 text-sm mt-1">Videos: {course.videos.length}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
