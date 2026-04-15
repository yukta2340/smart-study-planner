const express = require("express");
const router = express.Router();
const multer = require("multer");
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

// Task routes are kept open because the app currently authenticates with Clerk on frontend.
// Legacy JWT middleware can be restored after backend token strategy is unified.
router.get("/tasks", getTasks);
router.post("/add-task", addTask);
router.put("/update-task/:id", updateTask);
router.delete("/delete-task/:id", deleteTask);
router.post("/task-assistant", taskAssistant);
router.post("/upload-task-image", upload.single("taskImage"), uploadTaskImage);
router.post("/chat-assistant", chatAssistant);
router.get("/ai-suggestions", getAISuggestions);
router.post("/notify-task-push", sendTaskPushNotification);
router.post("/notify-task-sms", sendTaskPushNotification);
router.post("/register-device-token", registerDeviceToken);

module.exports = router;