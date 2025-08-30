import mongoose from "mongoose";

// Subschema for video
const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Video title is required"] },
    public_id: { type: String, required: [true, "Video public_id is required"] },
    url: { type: String, required: [true, "Video URL is required"] },
  },
  { _id: true } // ✅ ensures each video gets its own ObjectId
);

const courseSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Course title is required"], 
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"] 
    },
    description: { 
      type: String, 
      required: [true, "Description is required"], 
      minlength: [10, "Description must be at least 10 characters long"] 
    },
    instructor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    thumbnail: {
      public_id: { type: String, required: [true, "Thumbnail public_id is required"] },
      url: { type: String, required: [true, "Thumbnail URL is required"] },
    },
    videos: [videoSchema], // ✅ each video gets its own _id
    duration: { 
      type: String, 
      required: [true, "Duration is required"], 
      match: [/^[0-9]+ (hours|days|weeks|months)$/, "Duration must be like '10 hours' or '6 weeks'"] 
    },
    price: { 
      type: Number, 
      required: [true, "Price is required"], 
      min: [0, "Price cannot be negative"] 
    },
    discountPrice: { 
      type: Number, 
      default: 0,
      validate: {
        validator: function (val) {
          // discount must be less than price
          return val <= this.price;
        },
        message: "Discount price cannot be greater than original price"
      }
    },
    isFree: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto enforce free course logic
courseSchema.pre("save", function (next) {
  if (this.isFree) {
    this.price = 0;
    this.discountPrice = 0;
  }
  next();
});

export default mongoose.model("Course", courseSchema);
