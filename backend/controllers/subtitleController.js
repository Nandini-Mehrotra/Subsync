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

    // Mark processing
    subtitle.status = "processing";
    await subtitle.save();

    const scriptPath = path.join(__dirname, "../transcribe.py");
    const filePath = path.join(__dirname, "..", subtitle.filePath);

    execFile("python", [scriptPath, filePath], async (error, stdout, stderr) => {
      try {
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

        // Parse Python output
        const output = JSON.parse(stdout);

        subtitle.transcriptText = output.transcriptText || "";
        subtitle.hinglishText = output.hinglishText || "";
        subtitle.segments = output.segments || [];
        subtitle.status = "completed";

        await subtitle.save();

        res.json({
          message: "Transcript generated successfully",
          subtitle,
        });
      } catch (parseError) {
        console.log("Parse error:", parseError.message);

        subtitle.status = "failed";
        await subtitle.save();

        res.status(500).json({
          message: "Failed to parse transcript output",
          error: parseError.message,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Transcript generation failed",
      error: error.message,
    });
  }
};

module.exports = { generateTranscript };