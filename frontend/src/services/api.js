import axios from "axios";

const isProd = import.meta.env.PROD;
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

const runningWithoutBackend = isProd && !configuredApiUrl;
const resolvedBaseUrl = configuredApiUrl || (isProd ? "https://your-backend-api.com/api" : "http://localhost:5000/api");

if (isProd && !configuredApiUrl) {
  console.warn(
    "VITE_API_URL is not set. Running in frontend-only mode (no backend)."
  );
}

// 🌐 Base URL
const API = axios.create({
  baseURL: resolvedBaseUrl,
});

// 🔐 Attach tokens to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// =====================
// 🔐 AUTH APIs
// =====================
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);

// =====================
// 📚 SUBJECT APIs
// =====================
export const getSubjects = () => API.get("/subjects");
export const createSubject = (data) => API.post("/subjects", data);
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);

// =====================
// 📖 TOPIC APIs
// =====================
export const getTopics = (subjectId) => API.get(`/topics/${subjectId}`);
export const createTopic = (data) => API.post("/topics", data);
export const updateTopic = (id, data) => API.put(`/topics/${id}`, data);
export const deleteTopic = (id) => API.delete(`/topics/${id}`);

// =====================
// 🧠 AI & PLANNING APIs
// =====================
// Get the 7-Day Smart Roadmap (Normalized, Adaptive, Session-Split)
export const getWeeklyRoadmap = () => API.get("/ai/weekly-roadmap");

// Record Feedback for the Learning Loop
export const recordAIFeedback = (topicId, rating) => API.post("/ai/feedback", { topicId, rating });

// =====================
// 📊 ANALYTICS APIs
// =====================
export const getDashboardStats = () => API.get("/analytics/dashboard");
export const saveStudySession = (data) => API.post("/analytics/session", data);

// =====================
// 📋 LEGACY TASK APIs (For Backward Compatibility)
// =====================
export const getTasks = () => API.get("/tasks/");
export const addTask = (data) => API.post("/tasks/add-task", data);
export const updateTask = (id, data) => API.put(`/tasks/update-task/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/delete-task/${id}`);

export default API;