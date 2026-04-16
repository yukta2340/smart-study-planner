
import axios from "axios";

// 🌐 Base URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Store Clerk user ID when available
let currentClerkUserId = null;

export const setCurrentClerkUserId = (userId) => {
  console.log("🔐 Setting Clerk User ID:", userId);
  currentClerkUserId = userId;
};

export const getCurrentClerkUserId = () => currentClerkUserId;

// 🔐 Attach tokens and user ID to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  // Send Clerk user ID if available
  if (currentClerkUserId) {
    req.headers["X-User-ID"] = currentClerkUserId;
    console.log(`📤 Sending X-User-ID: ${currentClerkUserId} to ${req.url}`);
  } else {
    console.warn("⚠️ No Clerk User ID available for request:", req.url);
  }

  return req;
});

// Log response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized:", error.response?.data);
    }
    return Promise.reject(error);
  }
);

// =====================
// 🔐 AUTH APIs
// =====================

// Login
export const loginUser = (data) => API.post("/login", data);

// Register
export const registerUser = (data) => API.post("/register", data);

// =====================
// 📱 OTP APIs
// =====================

// Send OTP
export const sendOTP = (phone) => API.post("/send-otp", { phone });

// Verify OTP
export const verifyOTP = (data) => API.post("/verify-otp", data);

// =====================
// 📋 TASK APIs
// =====================

// Get all tasks
export const getTasks = () => API.get("/tasks");

// Add task
export const addTask = (data) => API.post("/add-task", data);

// Update task
export const updateTask = (id, data) =>
  API.put(`/update-task/${id}`, data);

// Delete task
export const deleteTask = (id) =>
  API.delete(`/delete-task/${id}`);

// Task AI assistant
export const getTaskAssistantHelp = (data) =>
  API.post("/task-assistant", data);

// Create task from uploaded image (OCR)
export const uploadTaskImage = (file, completed = false) => {
  const formData = new FormData();
  formData.append("taskImage", file);
  formData.append("completed", completed ? "true" : "false");

  return API.post("/upload-task-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Mini ChatGPT-style assistant
export const chatWithAssistant = (data) =>
  API.post("/chat-assistant", data);

// AI dashboard suggestions
export const getAISuggestions = () =>
  API.get("/ai-suggestions");

// Trigger push notification (FCM) for task reminder types (today, 1h, overdue)
export const notifyTaskPush = (taskId, alertType) =>
  API.post("/notify-task-push", { taskId, alertType });

// Register a browser FCM device token into MongoDB
export const registerDeviceToken = (token) =>
  API.post("/register-device-token", { token });

// =====================
// 🤖 AI PLAN API
// =====================

export const generatePlan = () =>
  API.post("/generate-plan");

export default API;