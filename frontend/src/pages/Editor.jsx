import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [message, setMessage] = useState("");

  const fetchProject = async () => {
    try {
      const res = await API.get(`/subtitles/${id}`);
      setProject(res.data);
      setTranscriptText(res.data.hinglishText || res.data.transcriptText || "");
    } catch (error) {
      setMessage("Failed to load project");
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  const handleSave = async () => {
    try {
      const res = await API.put(`/subtitles/${id}`, {
        hinglishText: transcriptText,
      });
      setMessage(res.data.message);
    } catch (error) {
      setMessage("Failed to save transcript");
    }
  };

  if (!project) return <p>Loading project...</p>;

  return (
    <div className="editor-container">
      <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
        ← Back
      </button>

      <div className="editor-card">
      <h1>Subtitle Editor</h1>

      <p className="editor-file">{project.originalFileName}</p>

      <span className="status-badge status-completed">
        {project.status}
      </span>

      {/* Video / Audio Preview */}
      {project.filePath && (
        <div className="preview-box">
          {project.originalFileName?.match(/\.(mp4|mov|webm)$/i) ? (
            <video
              className="media-preview"
              src={`http://localhost:5000/${project.filePath.replaceAll("\\", "/")}`}
              controls
            />
          ) : (
            <audio
              className="media-preview"
              src={`http://localhost:5000/${project.filePath.replaceAll("\\", "/")}`}
              controls
            />
          )}
        </div>
      )}

      <textarea
        className="editor-textarea"
        value={transcriptText}
        onChange={(e) => setTranscriptText(e.target.value)}
        placeholder="Edit transcript here..."
      />

      <button className="btn-primary" onClick={handleSave}>
        Save Transcript
      </button>

        {message && <p className="success-msg">{message}</p>}
      </div>
    </div>
  );
}

export default Editor;