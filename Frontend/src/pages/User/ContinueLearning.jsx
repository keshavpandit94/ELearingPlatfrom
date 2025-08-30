import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  Play, Pause, CheckCircle, BookOpen, Clock, User, ArrowLeft,
  Volume2, VolumeX, Maximize, SkipForward, SkipBack, RotateCcw,
  Star, Download, Settings, List, Trophy, Target
} from "lucide-react";
import { useParams } from "react-router-dom";

export default function ContinueLearning() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const token = localStorage.getItem("token");

  // Fetch course + progress
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        console.log(res.data.videos);        
        setCourse(res.data.course);
        // Pick first video or resume last watched
        setCurrentVideo(res.data.videos[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching course:", err);
        setLoading(false);
      });
    
    axios
      .get(`/api/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        console.log(res.data);        
        // setCourse(res.data.course);
        // Pick first video or resume last watched
        // setCurrentVideo(res.data.videos[0]);
        setProgress(res.data)
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching course:", err);
        setLoading(false);
      });
    
  }, [courseId, token]);

  // Save progress API
  const handleProgress = (lessonId, percent) => {
    setProgress((prev) => ({ ...prev, [lessonId]: percent }));

    axios
      .post(
        "/api/progress/update",
        { courseId, lessonId, percent },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        console.log("Progress saved:", res.data);
      })
      .catch((err) => {
        console.error("Error saving progress:", err);
      });
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = (e) => {
    const current = e.target.currentTime;
    const total = e.target.duration;
    setCurrentTime(current);
    setDuration(total);

    if (total > 0) {
      const percent = (current / total) * 100;
      handleProgress(currentVideo._id, Math.floor(percent));
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const changePlaybackSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const selectVideo = (video) => {
    setCurrentVideo(video);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const goToNextVideo = () => {
    const currentIndex = course.videos.findIndex(v => v._id === currentVideo._id);
    if (currentIndex < course.videos.length - 1) {
      selectVideo(course.videos[currentIndex + 1]);
    }
  };

  const goToPreviousVideo = () => {
    const currentIndex = course.videos.findIndex(v => v._id === currentVideo._id);
    if (currentIndex > 0) {
      selectVideo(course.videos[currentIndex - 1]);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletionPercentage = () => {
    const totalVideos = course?.videos.length || 0;
    const completedVideos = Object.values(progress).filter(p => p >= 90).length;
    return totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{course.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {course.instructor?.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Course Progress</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{getCompletionPercentage()}%</span>
                </div>
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Video Player Section */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'mr-0' : 'lg:mr-80'}`}>
          <div className="p-6">
            {currentVideo ? (
              <div className="space-y-4">
                {/* Video Container */}
                <div 
                  className="relative bg-black rounded-xl overflow-hidden shadow-2xl group"
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={() => {
                    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
                  }}
                  onMouseMove={() => {
                    setShowControls(true);
                    if (controlsTimeoutRef.current) {
                      clearTimeout(controlsTimeoutRef.current);
                      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
                    }
                  }}
                >
                  <video
                    ref={videoRef}
                    src={currentVideo.url}
                    className="w-full aspect-video"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={togglePlay}
                        className="p-4 bg-blue-600/80 hover:bg-blue-600 rounded-full transition-all duration-200 transform hover:scale-110"
                      >
                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                      </button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                      {/* Progress Bar */}
                      <div 
                        className="w-full h-2 bg-white/20 rounded-full cursor-pointer group/progress"
                        onClick={handleSeek}
                      >
                        <div 
                          className="h-full bg-blue-500 rounded-full relative transition-all duration-150"
                          style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => skipTime(-10)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <SkipBack className="w-5 h-5" />
                          </button>
                          <button onClick={togglePlay} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>
                          <button onClick={() => skipTime(10)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <SkipForward className="w-5 h-5" />
                          </button>
                          <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </button>
                          <span className="text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="relative group/speed">
                            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
                              {playbackSpeed}x
                            </button>
                            <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 opacity-0 group-hover/speed:opacity-100 transition-opacity pointer-events-none group-hover/speed:pointer-events-auto">
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                                <button
                                  key={speed}
                                  onClick={() => changePlaybackSpeed(speed)}
                                  className="block w-full text-left px-3 py-1 hover:bg-white/20 rounded text-sm"
                                >
                                  {speed}x
                                </button>
                              ))}
                            </div>
                          </div>
                          <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <Settings className="w-5 h-5" />
                          </button>
                          <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <Maximize className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{currentVideo.title}</h2>
                      <div className="flex items-center gap-4 text-gray-400">
                        <span>Lesson {currentVideo.order} of {course.videos.length}</span>
                        <span>Duration: {currentVideo.duration}</span>
                        <span>Progress: {progress[currentVideo._id] || 0}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Star className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <button
                      onClick={goToPreviousVideo}
                      disabled={course.videos[0]._id === currentVideo._id}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <SkipBack className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={goToNextVideo}
                      disabled={course.videos[course.videos.length - 1]._id === currentVideo._id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      Next
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Select a lesson to start learning</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <div className={`fixed lg:relative top-0 right-0 h-full lg:h-auto w-80 bg-gray-800/95 lg:bg-gray-800/50 backdrop-blur border-l border-gray-700 transition-transform duration-300 ${sidebarCollapsed ? 'translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden' : 'translate-x-0'} z-50`}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Course Content
              </h3>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 hover:bg-white/10 rounded lg:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-600/20 rounded-lg p-3 text-center">
                <Trophy className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold">{Object.values(progress).filter(p => p >= 90).length}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="bg-green-600/20 rounded-lg p-3 text-center">
                <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <div className="text-lg font-bold">{course.videos.length}</div>
                <div className="text-xs text-gray-400">Total Lessons</div>
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              {course.videos.map((lesson, index) => {
                const isCompleted = progress[lesson._id] >= 90;
                const isInProgress = progress[lesson._id] > 0 && progress[lesson._id] < 90;
                const isCurrent = currentVideo?._id === lesson._id;
                
                return (
                  <div
                    key={lesson._id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                      isCurrent
                        ? "bg-blue-600/30 border-blue-500"
                        : "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50"
                    }`}
                    onClick={() => selectVideo(lesson)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : isCurrent ? (
                          <Pause className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Lesson {lesson.order}</span>
                          <span className="text-xs text-gray-400">{lesson.duration}</span>
                        </div>
                        <h4 className={`font-medium text-sm leading-tight ${
                          isCurrent ? "text-blue-300" : "text-white"
                        }`}>
                          {lesson.title}
                        </h4>
                        
                        {/* Progress Bar */}
                        <div className="mt-2 w-full bg-gray-600 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full transition-all duration-300 ${
                              isCompleted ? "bg-green-400" : 
                              isInProgress ? "bg-blue-400" : "bg-gray-600"
                            }`}
                            style={{ width: `${progress[lesson._id] || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
