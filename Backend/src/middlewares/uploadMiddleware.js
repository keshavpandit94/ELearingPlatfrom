import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Image storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "courses/images",
    allowed_formats: ["jpg", "png", "jpeg"],
    resource_type: "image",
  },
});

// Video storage
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "courses/videos",
    allowed_formats: ["mp4", "avi", "mkv", "mov"],
    resource_type: "video",
  },
});

export const uploadImage = multer({ storage: imageStorage });
export const uploadVideos = multer({ storage: videoStorage });
