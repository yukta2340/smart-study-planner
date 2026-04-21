const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  taskAssistant,
  uploadTaskImage,
  chatAssistant,
  getAISuggestions,
  sendTaskPushNotification,
  registerDeviceToken,
} = require("../controllers/taskController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 🔐 All task routes are now protected with authMiddleware
// Supports both Clerk tokens (X-User-ID header) and legacy JWT tokens
router.get("/tasks", authMiddleware, getTasks);
router.post("/add-task", authMiddleware, addTask);
router.put("/update-task/:id", authMiddleware, updateTask);
router.delete("/delete-task/:id", authMiddleware, deleteTask);
router.post("/task-assistant", authMiddleware, taskAssistant);
router.post("/upload-task-image", authMiddleware, upload.single("taskImage"), uploadTaskImage);
router.post("/chat-assistant", authMiddleware, chatAssistant);
router.get("/ai-suggestions", authMiddleware, getAISuggestions);
router.post("/notify-task-push", authMiddleware, sendTaskPushNotification);
router.post("/notify-task-sms", authMiddleware, sendTaskPushNotification);
router.post("/register-device-token", authMiddleware, registerDeviceToken);

module.exports = router;