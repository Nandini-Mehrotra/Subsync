import { useState, useEffect, useRef } from "react";  // Add useRef
import { useNavigate } from "react-router-dom";
import { getSubtitles, uploadFile, generateTranscript } from "../services/api";

// Format date nicely
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fileIcon(filename) {
  if (!filename) return "FILE";
  const ext = filename.split(".").pop().toLowerCase();
  if (["mp4", "mov", "webm", "avi"].includes(ext)) return "VIDEO";
  if (["mp3", "wav", "m4a", "ogg"].includes(ext)) return "AUDIO";
  return "FILE";
}

// Toast component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const icons = { success: "Yes", error: "No", info: "i" };
  return (
    <div className={`toast ${type}`}>
      <span>{icons[type]}</span>
      {message}
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [toast, setToast]             = useState(null);

  // Ref to trigger file input
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "user";
  const avatarLetter = email[0].toUpperCase();

  function showToast(message, type = "info") {
    setToast({ message, type });
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const data = await getSubtitles();
      setProjects(data);
    } catch (err) {
      showToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }

  // Handle file selection
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  }

  // Open file picker manually
  function openFilePicker() {
    fileInputRef.current.click();
  }

  // Drag events
  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    // Grab dropped file
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }

  // Upload file
  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    try {
      // Send FormData
      const formData = new FormData();
      formData.append("file", selectedFile);
      await uploadFile(formData);
      setSelectedFile(null);
      // Reset file input
      fileInputRef.current.value = "";
      showToast("File uploaded successfully!", "success");
      fetchProjects();
    } catch (err) {
      showToast("Upload failed. Try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  // Generate transcript
  async function handleGenerate(id) {
    setGeneratingId(id);
    try {
      await generateTranscript(id);
      showToast("Transcript generation started!", "info");
      setTimeout(fetchProjects, 1500);
    } catch (err) {
      showToast("Generation failed. Try again.", "error");
    } finally {
      setGeneratingId(null);
    }
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/login");
  }

  function StatusBadge({ status }) {
    return (
      <span className={`status-badge status-${status}`}>
        {status}
      </span>
    );
  }

    async function handleDownload(id, type) {
  try {
    const res = await API.get(`/subtitles/${id}/download/${type}`, {
      responseType: "blob",
    });

    // Create downloadable file
    const url = window.URL.createObjectURL(new Blob([res.data]));

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `subtitle.${type}`);

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    showToast(`${type.toUpperCase()} downloaded`, "success");

  } catch (err) {
    console.log(err.response?.data || err.message);

    showToast("Download failed", "error");
  }
}
  return (
    <div className="dashboard-layout">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">▶</div>
          <span className="logo-name">SubSync</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="active">🗂 Projects</a>
          <a href="#">📊 Analytics</a>
          <a href="#">⚙ Settings</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-row">
            <div className="user-avatar">{avatarLetter}</div>
            <span className="user-email">{email}</span>
          </div>
          <button className="btn-danger" style={{ width: "100%" }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">

        <div className="page-header">
          <div>
            <h1>Your Projects</h1>
            <p>Upload audio or video and generate subtitles instantly.</p>
          </div>
          <button className="btn-primary" style={{ width: "auto", padding: "10px 20px" }}
            onClick={fetchProjects}>
            ↻ Refresh
          </button>
        </div>

        {/* Hidden file input — outside the zone, triggered by ref */}
        <input
          type="file"
          accept="audio/*,video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* Upload Zone */}
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">⬆</div>

          {selectedFile ? (
            <>
              <div className="selected-file">
                {fileIcon(selectedFile.name)} {selectedFile.name}
              </div>
              <div className="upload-actions">
                {/* This now safely calls handleUpload */}
                <button
                  className="btn-primary"
                  style={{ width: "auto", padding: "10px 22px" }}
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading && <span className="spinner" />}
                  {uploading ? "Uploading…" : "Upload File"}
                </button>
                <button className="btn-secondary" onClick={() => {
                  setSelectedFile(null);
                  fileInputRef.current.value = "";
                }}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>Drop your file here</h3>
              <p>Supports MP4, MOV, MP3, WAV, M4A — up to 500 MB</p>
              {/* Clicking this opens the file picker */}
              <button className="btn-secondary" onClick={openFilePicker}>
                Browse files
              </button>
            </>
          )}
        </div>

        {/* ── Projects Grid ── */}
        <h2 className="section-title">
          Recent Projects {!loading && `(${projects.length})`}
        </h2>

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <h3>Loading projects…</h3>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No projects yet</h3>
            <p>Upload an audio or video file to get started.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onGenerate={handleGenerate}
                generatingId={generatingId}
                StatusBadge={StatusBadge}
                navigate={navigate}
                onDownload={handleDownload}

              />
            ))}
          </div>
        )}
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

// ── Project Card ──
function ProjectCard({ project, onGenerate, generatingId, StatusBadge, navigate, onDownload }) {
  const isGenerating = generatingId === project._id;
  const isCompleted  = project.status === "completed";
  const isProcessing = project.status === "processing";
  const canGenerate  = project.status === "uploaded" || project.status === "failed";

  
  function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function makeSRT(text) {
  return `1
00:00:00,000 --> 00:00:10,000
${text}
`;
}
  return (
    <div className="project-card">
      <div className="card-header">
        <div className="card-file-icon">
          {fileIcon(project.originalFileName)}
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="card-filename">
        {project.originalFileName || "Untitled file"}
      </div>

      <div className="card-date">
        {project.createdAt ? formatDate(project.createdAt) : "—"}
      </div>

    {canGenerate && (
        <button
          className="btn-primary"
          onClick={() => onGenerate(project._id)}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Transcript"}
        </button>
      )}

      {isProcessing && (
        <p className="processing-text">Processing...</p>
      )}
      {isCompleted && (
        <div className="project-actions">
          <button
            className="btn-secondary"
            onClick={() =>
              navigator.clipboard.writeText(project.transcriptText || "")
            }
          >
            Copy Transcript
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate(`/editor/${project._id}`)}
          >
            Edit
          </button>

          <button
            className="btn-secondary"
            onClick={() =>
              downloadTextFile("subtitle.txt", project.transcriptText || "")
            }
          >
            TXT
          </button>

          <button
            className="btn-secondary"
            onClick={() =>
              downloadTextFile("subtitle.srt", makeSRT(project.transcriptText || ""))
            }
          >
            SRT
          </button>
        </div>
      )}
    </div>
  );
}