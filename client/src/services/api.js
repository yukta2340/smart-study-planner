
import axios from "axios";

const isProd = import.meta.env.PROD;
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

const runningWithoutBackend = isProd && !configuredApiUrl;
const resolvedBaseUrl = configuredApiUrl || (isProd ? "" : "http://localhost:5000");

if (isProd && !configuredApiUrl) {
  console.warn(
    "VITE_API_URL is not set. Running in frontend-only mode (no backend)."
  );
}

// 🌐 Base URL
const API = axios.create({
  baseURL: resolvedBaseUrl,
});

// Store Clerk user ID when available
let currentClerkUserId = null;

export const setCurrentClerkUserId = (userId) => {
  console.log("🔐 Setting Clerk User ID:", userId);
  currentClerkUserId = userId;
};

export const getCurrentClerkUserId = () => currentClerkUserId;

function storageKey() {
  return `ssp_tasks_${currentClerkUserId || "anon"}`;
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(storageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(storageKey(), JSON.stringify(tasks));
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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
export const loginUser = (data) => {
  if (runningWithoutBackend) {
    return Promise.reject(new Error("Login API not available (frontend-only deployment)."));
  }
  return API.post("/login", data);
};

// Register
export const registerUser = (data) => {
  if (runningWithoutBackend) {
    return Promise.reject(new Error("Register API not available (frontend-only deployment)."));
  }
  return API.post("/register", data);
};

// =====================
// 📱 OTP APIs
// =====================

// Send OTP
export const sendOTP = (phone) => {
  if (runningWithoutBackend) {
    return Promise.reject(new Error("OTP is not available (frontend-only deployment)."));
  }
  return API.post("/send-otp", { phone });
};

// Verify OTP
export const verifyOTP = (data) => {
  if (runningWithoutBackend) {
    return Promise.reject(new Error("OTP is not available (frontend-only deployment)."));
  }
  return API.post("/verify-otp", data);
};

// =====================
// 📋 TASK APIs
// =====================

// Get all tasks
export const getTasks = () => {
  if (runningWithoutBackend) {
    const tasks = loadTasks().sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    return Promise.resolve({ data: tasks });
  }
  return API.get("/tasks");
};

// Add task
export const addTask = (data) => {
  if (runningWithoutBackend) {
    const tasks = loadTasks();
    const now = new Date().toISOString();
    const task = {
      _id: uid(),
      subject: data?.subject || "Untitled",
      description: data?.description || "",
      deadline: data?.deadline || now,
      difficulty: data?.difficulty ?? 3,
      completed: Boolean(data?.completed),
      createdAt: now,
    };
    tasks.push(task);
    saveTasks(tasks);
    return Promise.resolve({ data: task });
  }
  return API.post("/add-task", data);
};

// Update task
export const updateTask = (id, data) =>
  (runningWithoutBackend
    ? Promise.resolve().then(() => {
        const tasks = loadTasks();
        const idx = tasks.findIndex((t) => t._id === id);
        if (idx === -1) throw new Error("Task not found");
        tasks[idx] = { ...tasks[idx], ...data };
        saveTasks(tasks);
        return { data: tasks[idx] };
      })
    : API.put(`/update-task/${id}`, data));

// Delete task
export const deleteTask = (id) =>
  (runningWithoutBackend
    ? Promise.resolve().then(() => {
        const tasks = loadTasks().filter((t) => t._id !== id);
        saveTasks(tasks);
        return { data: { ok: true } };
      })
    : API.delete(`/delete-task/${id}`));

// Task AI assistant
export const getTaskAssistantHelp = (data) =>
  (runningWithoutBackend
    ? Promise.reject(new Error("AI assistant is not available (frontend-only deployment)."))
    : API.post("/task-assistant", data));

// Create task from uploaded image (OCR)
export const uploadTaskImage = (file, completed = false) => {
  if (runningWithoutBackend) {
    return Promise.reject(new Error("OCR upload is not available (frontend-only deployment)."));
  }
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
  (runningWithoutBackend
    ? Promise.resolve({
        data: {
          response:
            "This deployment is frontend-only (no server). To enable AI responses, deploy the backend or connect an AI API from the client.",
        },
      })
    : API.post("/chat-assistant", data));

// AI dashboard suggestions
export const getAISuggestions = () =>
  (runningWithoutBackend
    ? Promise.resolve({
        data: {
          suggestions: [
            { type: "tip", text: "Add 3 tasks for today, then start with the easiest one to build momentum." },
            { type: "warning", text: "Set realistic deadlines—break large topics into smaller tasks." },
            { type: "info", text: "Your tasks are stored in this browser (localStorage). Use the same device to keep them." },
          ],
        },
      })
    : API.get("/ai-suggestions"));

// Trigger push notification (FCM) for task reminder types (today, 1h, overdue)
export const notifyTaskPush = (taskId, alertType) =>
  (runningWithoutBackend
    ? Promise.resolve({ data: { ok: true } })
    : API.post("/notify-task-push", { taskId, alertType }));

// Register a browser FCM device token into MongoDB
export const registerDeviceToken = (token) =>
  (runningWithoutBackend
    ? Promise.resolve({ data: { ok: true } })
    : API.post("/register-device-token", { token }));

// =====================
// 🤖 AI PLAN API
// =====================

export const generatePlan = () =>
  (runningWithoutBackend
    ? Promise.resolve({
        data: {
          plan: [
            "List today’s tasks and estimate minutes for each.",
            "Do 25 minutes focus + 5 minutes break (repeat 4 times).",
            "Finish with a 10 minute review and plan tomorrow.",
          ],
        },
      })
    : API.post("/generate-plan"));

export default API;