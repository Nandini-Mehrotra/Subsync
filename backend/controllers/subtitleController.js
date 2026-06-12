const { execFile } = require("child_process");
const path = require("path");
const Subtitle = require("../models/Subtitle");

const generateTranscript = async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ message: "Subtitle project not found" });
    }

    if (subtitle.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    subtitle.status = "processing";
    await subtitle.save();

    const scriptPath = path.join(__dirname, "../transcribe.py");
    const filePath = path.join(__dirname, "..", subtitle.filePath);

    execFile("python", [scriptPath, filePath], async (error, stdout, stderr) => {
      if (error) {
        console.log("Python error:", error);
        console.log("stderr:", stderr);

        subtitle.status = "failed";
        await subtitle.save();

        return res.status(500).json({
          message: "Transcript generation failed",
          error: stderr || error.message,
        });
      }

      subtitle.transcriptText = stdout.trim();
      subtitle.status = "completed";
      await subtitle.save();

      res.json({
        message: "Transcript generated successfully",
        subtitle,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Transcript generation failed",
      error: error.message,
    });
  }
};

module.exports = { generateTranscript };