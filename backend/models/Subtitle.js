const mongoose = require("mongoose");


// to store the uploaded subtitle file info, transcript text, and processing status for each user
const subtitleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalFileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    transcriptText: {
      type: String,
      default: "",
    },

    hinglishText: {
      type: String,
      default: "",
    },

      segments: [
    {
      start: Number,
      end: Number,
      text: String,
      hinglishText: {
        type: String,
        default: "",
      },
    },
  ],

    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subtitle", subtitleSchema);