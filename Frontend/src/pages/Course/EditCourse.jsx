import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Edit3, 
  BookOpen, 
  Clock, 
  DollarSign, 
  Tag, 
  FileText, 
  Upload, 
  Video, 
  Save, 
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import BACK_URL from "../../api";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [titles, setTitles] = useState([]);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    discountPrice: "",
    isFree: false,
  });
  const [updateStatus, setUpdateStatus] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch course details
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (token) {
      axios
        .get(`${BACK_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          // console.log(res.data);
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }

    setLoading(true);
    axios
      .get(`${BACK_URL}/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCourse(res.data);
        setEditData({
          title: res.data.title,
          description: res.data.description,
          duration: res.data.duration,
          price: res.data.price,
          discountPrice: res.data.discountPrice,
          isFree: res.data.isFree,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch course:", err);
        alert("Failed to load course details");
        navigate("/courses");
      })
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  // Handle form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateStatus("updating");

    try {
      await axios.put(
        `${BACK_URL}/api/courses/${id}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUpdateStatus("success");
      alert("Course updated successfully!");
      navigate(`/courses/${id}`);
    } catch (err) {
      console.error("Failed to update course:", err);
      setUpdateStatus("error");
      alert("Failed to update course. Please try again.");
    }
  };

  // Handle video upload
  const handleVideoUpload = async () => {
    if (!files.length || !titles.length) {
      alert("Please select files and provide titles");
      return;
    }

    if (titles.some(title => !title)) {
      alert("Please provide titles for all videos");
      return;
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("videos", file);
      formData.append("titles", titles[index]);
    });

    try {
      setUploadStatus("uploading");
      await axios.post(`${BACK_URL}/api/courses/${id}/videos`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      setUploadStatus("success");
      alert("Videos uploaded successfully!");
      setFiles([]);
      setTitles([]);
      window.location.reload();
    } catch (err) {
      console.error("Failed to upload videos:", err);
      setUploadStatus("error");
      alert("Failed to upload videos. Please try again.");
    }
  };

  // Remove file from upload list
  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
    setTitles(titles.filter((_, index) => index !== indexToRemove));
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate(`${BACK_URL}/courses/${id}`);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePreview = () => {
    window.open(`/courses/${id}`, '_blank');
  };

  const handlePublish = async () => {
    try {
      await axios.patch(`${BACK_URL}/api/courses/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Course published successfully!');
    } catch (err) {
      console.error('Failed to publish course:', err);
      alert('Failed to publish course. Please try again.');
    }
  };

  const handleAnalytics = () => {
    navigate(`${BACK_URL}/courses/${id}/analytics`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-blue-200 rounded-lg w-64 mb-8"></div>
            <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-24 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Edit3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
              <p className="text-gray-600 mt-1">Update course information and content</p>
            </div>
          </div>
          
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-gray-700 font-medium">Back</span>
          </button>
        </div>

        {/* Status Messages */}
        {updateStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            updateStatus === "success" 
              ? "bg-green-50 border border-green-200 text-green-800"
              : updateStatus === "error"
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}>
            {updateStatus === "success" && <CheckCircle className="w-5 h-5" />}
            {updateStatus === "error" && <AlertCircle className="w-5 h-5" />}
            {updateStatus === "loading" && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
            <span className="font-medium">
              {updateStatus === "success" && "Course updated successfully!"}
              {updateStatus === "error" && "Error updating course"}
              {updateStatus === "loading" && "Updating course..."}
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Course Details Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                Course Details
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Enter course description"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={editData.duration}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 8 weeks, 40 hours"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={editData.price}
                    onChange={handleChange}
                    disabled={editData.isFree}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Discount Price
                  </label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={editData.discountPrice}
                    onChange={handleChange}
                    disabled={editData.isFree}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={editData.isFree}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="font-semibold text-blue-800">
                    This is a free course
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={updateStatus === "loading"}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {updateStatus === "loading" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Course
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Video className="w-6 h-6" />
                Course Videos
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Course Videos
                </h3>
                <p className="text-gray-600 mb-4">
                  Select multiple video files to upload
                </p>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) => setFiles([...e.target.files])}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Choose Videos
                </label>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    Selected Videos ({files.length})
                  </h4>
                  
                  <div className="space-y-3">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Video className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 truncate max-w-xs">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(idx)}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video Title
                          </label>
                          <input
                            type="text"
                            placeholder={`Title for ${file.name.replace(/\.[^/.]+$/, "")}`}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            onChange={(e) => {
                              const newTitles = [...titles];
                              newTitles[idx] = e.target.value;
                              setTitles(newTitles);
                            }}
                            value={titles[idx] || ""}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleVideoUpload}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Upload className="w-5 h-5" />
                    Upload {files.length} Video{files.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}

              {/* Course Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Overview
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Duration: {editData.duration || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">
                      {editData.isFree ? 'Free Course' : `$${editData.price || 0}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={handlePreview}
              className="flex items-center gap-3 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Video className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Preview Course</span>
            </button>
            <button 
              onClick={handlePublish}
              className="flex items-center gap-3 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-700">Publish Course</span>
            </button>
            <button 
              onClick={handleAnalytics}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}