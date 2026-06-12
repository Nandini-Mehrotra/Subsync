import axios from "axios";

// Base URL
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token to every request
API.interceptors.request.use((config) => {
  // Get token
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──

// Signup call — send name, email, password
export async function signup(name, email, password) {
  const res = await API.post("/auth/signup", { name, email, password });
  return res.data;
}

// Login call
export async function login(email, password) {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
}

// ── Subtitles ──

// Fetch all projects
export async function getSubtitles() {
  const res = await API.get("/subtitles");
  return res.data;
}

// Upload file
export async function uploadFile(formData) {
  const res = await API.post("/subtitles/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Generate transcript
export async function generateTranscript(id) {
  const res = await API.post(`/subtitles/${id}/generate`);
  return res.data;
}


// Make this API variable available to other files
export default API;