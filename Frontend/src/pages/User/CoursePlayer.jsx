import { useParams } from "react-router-dom";
import { Play, CheckCircle, Video, Clock } from "lucide-react";
import useCourseProgress from "../../hooks/useCourseProgress";

function formatVideoTime(seconds = 0) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CoursePlayer({ token }) {
  const { courseId } = useParams();

  let userId;
  if (typeof window !== "undefined") {
    try {
      const u = localStorage.getItem("user");
      userId = u ? JSON.parse(u)?._id : undefined;
    } catch {
      userId = undefined;
    }
  }

  const {
    course,
    progress,
    currentVideo,
    lastWatchedVideo,
    loading,
    handleProgress,
    handleVideoChange,
    handleVideoEnded,
    completionPercent,
    videoRef,
  } = useCourseProgress(courseId, { token, userId });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium animate-pulse">Loading course...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <div className="flex-1 p-4 lg:p-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">{course?.title}</h1>
        <p className="text-gray-500 mb-2">
          Overall Progress:{" "}
          <span className="font-semibold text-indigo-600">{completionPercent}%</span>
        </p>

        {lastWatchedVideo && (
          <div className="mb-4 p-2 bg-yellow-50 border-l-4 border-yellow-300 rounded">
            <span className="text-sm text-gray-700 font-medium">
              Last watched:
            </span>
            <span className="ml-2 text-indigo-700 font-semibold">
              {lastWatchedVideo.title}
            </span>
            <span className="ml-2 text-gray-500 text-xs">
              (
              {Math.round(lastWatchedVideo.percent || 0)}% · {" "}
              at {formatVideoTime(lastWatchedVideo.lastTimestamp || 0)}
              )
            </span>
          </div>
        )}

        <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            key={currentVideo?._id}
            src={currentVideo?.url}
            className="w-full aspect-video"
            onTimeUpdate={(e) => {
              if (currentVideo) {
                const percent =
                  (e.target.currentTime / e.target.duration) * 100;
                handleProgress(
                  String(currentVideo._id),
                  percent,
                  Math.floor(e.target.currentTime)
                );
              }
            }}
            onEnded={handleVideoEnded}
            controls
          />
        </div>
      </div>

      <aside className="w-full lg:w-80 bg-white border-l border-gray-200 p-4 lg:p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <Video size={20} /> Course Content
        </h2>
        <ul className="space-y-3">
          {course?.videos?.map((vid, index) => {
            const vidProgress = progress[vid._id] || {};
            const watched = vidProgress.completed;
            const isActive = currentVideo?._id === vid._id;
            return (
              <li
                key={vid._id}
                onClick={() => handleVideoChange(vid)}
                className={[
                  "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all shadow-sm",
                  isActive
                    ? "bg-indigo-100 border-l-4 border-indigo-600"
                    : watched
                    ? "bg-green-50 border-l-4 border-green-400"
                    : "bg-gray-50 hover:bg-gray-100",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  {watched ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <Play
                      className={isActive ? "text-indigo-600" : "text-gray-400"}
                      size={20}
                    />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-indigo-700" : "text-gray-700"
                      }`}
                    >
                      {index + 1}. {vid.title}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {Math.round(vidProgress.percent || 0)}% watched
                      {vidProgress.lastTimestamp !== undefined &&
                        <> · stopped at {formatVideoTime(vidProgress.lastTimestamp)}</>
                      }
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
