const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const Subtitle = require("../models/Subtitle");
const { generateTranscript } = require("../controllers/subtitleController");

// Multer acts as a middleware or a bridge between the client-side form submission and your server making it easier to process any uploaded files
// mainly for multipart/form-data
// an HTTP request format used to send binary filesa nand text data simultaneously


const router = express.Router();

// Store uploaded files in uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload audio/video file
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    const subtitle = await Subtitle.create({
      user: req.user._id,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      status: "uploaded",
    });

    res.status(201).json({
      message: "File uploaded successfully",
      subtitle,
    });
  } catch (error) {
    res.status(500).json({
      message: "File upload failed",
      error: error.message,
    });
  }
});

// Get all uploaded subtitle projects of logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const subtitles = await Subtitle.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(subtitles);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subtitles",
      error: error.message,
    });
  }
});

router.post("/:id/generate", protect, generateTranscript);

// Get one project
router.get("/:id", protect, async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (subtitle.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(subtitle);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// Update transcript
router.put("/:id", protect, async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (subtitle.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    subtitle.transcriptText = req.body.transcriptText;

    await subtitle.save();

    res.json({
      message: "Transcript saved",
      subtitle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save transcript",
    });
  }
});

// Download TXT
router.get("/:id/download/txt", protect, async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (subtitle.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${subtitle.originalFileName}.txt"`
    );

    res.send(subtitle.transcriptText || "");
  } catch (error) {
    res.status(500).json({ message: "TXT download failed" });
  }
});


// Download SRT
router.get("/:id/download/srt", protect, async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (subtitle.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const text = subtitle.transcriptText || "";

    const srtContent = `1
00:00:00,000 --> 00:00:10,000
${text}
`;

    res.setHeader("Content-Type", "application/x-subrip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${subtitle.originalFileName}.srt"`
    );

    res.send(srtContent);
  } catch (error) {
    res.status(500).json({ message: "SRT download failed" });
  }
});

// Delete project
router.delete("/:id", protect, async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (subtitle.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Subtitle.findByIdAndDelete(req.params.id);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});
module.exports = router;