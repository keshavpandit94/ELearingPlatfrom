import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import BACK_URL from "../api";

export default function useCourseProgress(courseId, { token, userId } = {}) {
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [lastWatchedVideo, setLastWatchedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);
  const lastSentRef = useRef({});
  const throttleDelay = 2000; // 2 sec

  // Fetch course + progress
  useEffect(() => {
    if (!courseId || !token) return;
    setLoading(true);

    Promise.all([
      axios.get(`${BACK_URL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACK_URL}/api/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([courseRes, progressRes]) => {
        setCourse(courseRes.data);

        const { videos = [], lastVideo } = progressRes.data;
        const progressMap = {};

        videos.forEach((v) => {
          if (v?._id) {
            progressMap[v._id] = {
              percent: v.progress || 0,
              lastTimestamp: v.lastTimestamp || 0,
              completed: !!v.completed,
              title: v.title || "",
            };
          }
        });

        setProgress(progressMap);

        // Save last watched video for display
        if (lastVideo?.videoId) {
          setLastWatchedVideo({
            videoId: lastVideo.videoId,
            percent: lastVideo.progress || 0,
            lastTimestamp: lastVideo.lastTimestamp || 0,
            completed: !!lastVideo.completed,
            title: videos.find((v) => v._id === lastVideo.videoId)?.title || "",
          });
        } else {
          setLastWatchedVideo(null);
        }

        // Set video to resume
        let startVideo = null;
        if (lastVideo?.videoId) {
          startVideo = courseRes.data.videos.find(
            (v) => v._id?.toString() === lastVideo.videoId?.toString()
          );
        }
        if (!startVideo && courseRes.data.videos?.length > 0) {
          startVideo = courseRes.data.videos[0];
        }

        if (startVideo) {
          setCurrentVideo({
            ...startVideo,
            videoId: startVideo._id.toString(),
            lastTimestamp: progressMap[startVideo._id]?.lastTimestamp || 0,
          });
        }
      })
      .catch((err) => console.error("Error fetching course data:", err))
      .finally(() => setLoading(false));
  }, [courseId, token]);

  // Save progress (throttled)
  const handleProgress = useCallback(
    (videoId, percentValue, lastTimestamp = 0) => {
      if (!videoId || !token) return;

      const now = Date.now();
      if (now - (lastSentRef.current[videoId] || 0) < throttleDelay) return;
      lastSentRef.current[videoId] = now;

      const cleanPercent = Math.min(Math.max(Number(percentValue) || 0, 0), 100);
      const cleanTimestamp = Math.max(Number(lastTimestamp) || 0, 0);

      setProgress((prev) => ({
        ...prev,
        [videoId]: {
          ...(prev[videoId] || {}),
          percent: cleanPercent,
          lastTimestamp: cleanTimestamp,
          completed: cleanPercent >= 90,
        },
      }));

      axios
        .post(
          `${BACK_URL}/api/progress/update`,
          { courseId, videoId, progress: cleanPercent, lastTimestamp: cleanTimestamp },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => console.log("✅ Progress saved:", res.data))
        .catch((err) =>
          console.error("❌ Error saving progress:", err.response?.data || err)
        );
    },
    [courseId, token]
  );

  // Switch current video
  const handleVideoChange = useCallback(
    (video) => {
      if (!video?._id) return;

      const prog = progress[video._id] || {};
      const lastTimestamp = prog.lastTimestamp || 0;

      setCurrentVideo({
        ...video,
        videoId: video._id.toString(),
        lastTimestamp,
      });

      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.currentTime = lastTimestamp;
        videoRef.current.play().catch((err) =>
          console.warn("Autoplay prevented:", err)
        );
      }
    },
    [progress]
  );

  // Autoplay next video on ended
  const handleVideoEnded = useCallback(() => {
    if (!course || !currentVideo) return;
    const idx = course.videos.findIndex((v) => v._id === currentVideo._id);
    if (idx >= 0 && idx < course.videos.length - 1) {
      handleVideoChange(course.videos[idx + 1]);
    }
  }, [course, currentVideo, handleVideoChange]);

  // Computed course completion %
  const completionPercent = useMemo(() => {
    if (!course?.videos?.length) return 0;
    const total = course.videos.length;
    const completed = Object.values(progress).filter((p) => p.completed).length;
    return Math.round((completed / total) * 100);
  }, [course, progress]);

  return {
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
  };
}
