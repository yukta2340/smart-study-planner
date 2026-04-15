const Task = require("../models/Task");
const DeviceToken = require("../models/DeviceToken");
const Tesseract = require("tesseract.js");
const { sendFCMNotification } = require("../utils/fcm");

const smsDedupeCache = new Map();

const parseDeadlineFromText = (text) => {
  const normalized = text.replace(/\n/g, " ");

  const isoMatch = normalized.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    const parsed = new Date(`${isoMatch[1]}T18:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const slashMatch = normalized.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, "0");
    const month = slashMatch[2].padStart(2, "0");
    const year = slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3];
    const parsed = new Date(`${year}-${month}-${day}T18:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const dueLineMatch = normalized.match(/(?:deadline|due|submit by)\s*[:\-]?\s*([^,.]+)/i);
  if (dueLineMatch) {
    const parsed = new Date(dueLineMatch[1]);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 2);
  fallback.setHours(18, 0, 0, 0);
  return fallback;
};

const parseDifficultyFromText = (text) => {
  const difficultyMatch = text.match(/difficulty\s*[:\-]?\s*([1-5])/i);
  if (difficultyMatch) return difficultyMatch[1];

  if (/hard|difficult|advanced/i.test(text)) return "4";
  if (/easy|basic|intro/i.test(text)) return "2";
  return "3";
};

const parseSubjectFromText = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const subjectLine = lines.find((line) => /^subject\s*[:\-]/i.test(line));
  if (subjectLine) {
    return subjectLine.replace(/^subject\s*[:\-]\s*/i, "").slice(0, 80);
  }

  const firstMeaningfulLine = lines.find((line) => /[a-zA-Z]/.test(line));
  if (firstMeaningfulLine) return firstMeaningfulLine.slice(0, 80);

  return "Task from image";
};

const parseDescriptionFromText = (text) => text.replace(/\s+/g, " ").trim().slice(0, 400);

const getUrgencyLabel = (deadline) => {
  const now = new Date();
  const due = new Date(deadline);
  const diffHours = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (Number.isNaN(diffHours)) return "unknown";
  if (diffHours < 0) return "overdue";
  if (diffHours <= 24) return "high";
  if (diffHours <= 72) return "medium";
  return "low";
};

const getDifficultyPlan = (difficulty) => {
  const parsed = Number(difficulty);

  if (parsed >= 4) {
    return {
      level: "hard",
      strategy: [
        "Break the task into micro-goals of 20-30 minutes each.",
        "Use active recall: solve without notes first, then compare and patch gaps.",
        "Do 2 focused practice rounds and log mistakes after each round.",
        "End with a 5-minute summary in your own words.",
      ],
    };
  }

  if (parsed === 3) {
    return {
      level: "medium",
      strategy: [
        "Split into concept review and one practice block.",
        "Use a timer: 25 minutes focus, 5 minutes break.",
        "Create a short revision note with top 3 takeaways.",
      ],
    };
  }

  return {
    level: "easy",
    strategy: [
      "Do a quick concept scan.",
      "Complete one targeted practice set.",
      "Mark any confusing part for later revision.",
    ],
  };
};

const generateLocalChatResponse = ({ userMessage, task }) => {
  const subject = task?.subject || "your study topic";
  const description = task?.description || "No description available.";
  const difficulty = task?.difficulty || "3";
  const deadlineText = task?.deadline ? new Date(task.deadline).toLocaleString() : "not specified";
  const urgency = task?.deadline ? getUrgencyLabel(task.deadline) : "unknown";
  const plan = getDifficultyPlan(difficulty);
  const lower = userMessage.toLowerCase();

  const baseAnswer = [
    `Subject: ${subject}`,
    `Description: ${description}`,
    `Difficulty: ${difficulty}/5`,
    `Deadline: ${deadlineText}`,
    `Urgency: ${urgency}`,
    "",
    "Study strategy:",
    ...plan.strategy.map((step, idx) => `${idx + 1}. ${step}`),
  ].join("\n");

  if (/study plan|plan|schedule|routine|time table|today|hours?/.test(lower)) {
    const sessionCount = /1\s*-?hour|one hour/.test(lower)
      ? 1
      : /3\s*-?hour|three hour/.test(lower)
      ? 3
      : /daily|day|today/.test(lower)
      ? 4
      : 2;
    const sessionText = [
      `Here is a simple ${sessionCount}-block study plan for this task:`,
      "",
      `1. Review the task and goal for 15 minutes. Focus on the key concept and expected outcome.`,
      `2. Work in focused blocks of 25 minutes with 5-minute breaks.`,
      `3. After each block, summarize what you learned and note any doubts.`,
      `4. Finish with a short revision or practice check in the last block.`,
      "",
      `Use this structure for ${subject} to stay consistent and avoid burnout.`,
    ].join("\n");
    return `${baseAnswer}\n\n${sessionText}`;
  }

  if (/explain|simplify|meaning|understand|how to|approach|solve|strategy/.test(lower)) {
    return `${baseAnswer}\n\nRecommendation:\n- Start with the concept overview.\n- Break the task into smaller parts.\n- Use active practice.\n- Review after each block.\n\nAsk me for a 1-hour plan, 3-hour plan, or a daily schedule for this task.`;
  }

  if (/deadline|due|late|overdue|today/.test(lower)) {
    return `${baseAnswer}\n\nDeadline advice:\n- Prioritize the most important problems first.\n- If due soon, reduce scope to essentials.\n- If you have more time, add a short review block at the end.`;
  }

  return `${baseAnswer}\n\nIf you'd like, ask me for a specific study plan: 1-hour, 3-hour, or daily routine for this task.`;
};

const getBillingFallbackReply = (task) => {
  const subject = task?.subject || "your current topic";
  const difficulty = task?.difficulty || "3";
  const deadlineText = task?.deadline ? new Date(task.deadline).toLocaleString() : "not specified";
  const plan = getDifficultyPlan(difficulty);

  return [
    "AI provider billing is currently unavailable, so here is a local study plan:",
    "",
    `Subject: ${subject}`,
    `Difficulty: ${difficulty}/5`,
    `Deadline: ${deadlineText}`,
    "",
    "Suggested approach:",
    ...plan.strategy.map((step, idx) => `${idx + 1}. ${step}`),
    "",
    "This is generated locally so you can keep planning without an external AI connection.",
  ].join("\n");
};

// 📥 Get All Tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// ➕ Add Task
exports.addTask = async (req, res) => {
  try {
    const { subject, description, deadline, difficulty } = req.body;

    if (!subject || !deadline || !difficulty) {
      return res.status(400).json({ error: "Subject, deadline, and difficulty are required" });
    }

    const parsedDeadline = new Date(deadline);
    if (Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ error: "Invalid deadline format" });
    }

    const newTask = new Task({
      subject,
      description: description || "",
      deadline: parsedDeadline,
      difficulty,
      completed: false,
    });

    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Add Task Error:", err);
    res.status(500).json({ error: "Failed to add task" });
  }
};

// ✏️ Update Task (complete / edit)
exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update Task Error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// ❌ Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete Task Error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

// 🤖 Explain Task + Suggest Better Approach
exports.taskAssistant = async (req, res) => {
  try {
    const { taskId, message } = req.body;

    if (!taskId && !message) {
      return res.status(400).json({ error: "taskId or message is required" });
    }

    let task = null;
    if (taskId) {
      task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
    }

    const subject = task?.subject || "General Study";
    const description = task?.description || "No description provided.";
    const difficulty = task?.difficulty || "3";
    const deadline = task?.deadline ? new Date(task.deadline).toLocaleString() : "Not specified";
    const urgency = task?.deadline ? getUrgencyLabel(task.deadline) : "unknown";
    const difficultyPlan = getDifficultyPlan(difficulty);

    const urgencyAdvice =
      urgency === "overdue"
        ? "This task is already overdue. Start immediately with the most scoring/important part first."
        : urgency === "high"
          ? "Deadline is very close. Focus only on high-impact topics and skip low-value extras."
          : urgency === "medium"
            ? "You have moderate time. Plan 2-3 focused sessions with revision checkpoints."
            : "You have enough runway. Build deep understanding first, then test yourself with practice.";

    const userPrompt = message ? `\n\nYour question: ${message}` : "";

    const reply = [
      `Task Explanation:`,
      `${subject} - ${description}`,
      ``,
      `Difficulty Insight:`,
      `This looks like a ${difficultyPlan.level} task (difficulty: ${difficulty}/5).`,
      ``,
      `Suggested Approach:`,
      ...difficultyPlan.strategy.map((step, idx) => `${idx + 1}. ${step}`),
      ``,
      `Deadline: ${deadline}`,
      `Urgency Advice: ${urgencyAdvice}`,
      userPrompt,
      ``,
      `If you want, ask me for a 1-hour, 3-hour, or daily plan for this exact task.`,
    ].join("\n");

    return res.json({
      success: true,
      response: reply,
      meta: {
        subject,
        difficulty,
        urgency,
      },
    });
  } catch (err) {
    console.error("Task Assistant Error:", err);
    return res.status(500).json({ error: "Failed to generate task guidance" });
  }
};

// 🖼️ Upload Task Image and Create Task Automatically
exports.uploadTaskImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Task image is required" });
    }

    const {
      data: { text: extractedTextRaw },
    } = await Tesseract.recognize(req.file.buffer, "eng");

    const extractedText = (extractedTextRaw || "").trim();
    if (!extractedText) {
      return res.status(400).json({ error: "Could not read text from image" });
    }

    const subject = parseSubjectFromText(extractedText);
    const description = parseDescriptionFromText(extractedText);
    const difficulty = parseDifficultyFromText(extractedText);
    const parsedDeadline = parseDeadlineFromText(extractedText);
    const completedFromUpload = String(req.body?.completed || "false").toLowerCase() === "true";

    const newTask = new Task({
      subject,
      description,
      difficulty,
      deadline: parsedDeadline,
      completed: completedFromUpload,
    });

    const savedTask = await newTask.save();

    return res.status(201).json({
      success: true,
      msg: "Task created from image",
      task: savedTask,
      extracted: {
        subject,
        difficulty,
        deadline: parsedDeadline,
      },
      extractedText,
    });
  } catch (err) {
    console.error("Upload Task Image Error:", err);
    return res.status(500).json({ error: "Failed to process image and create task" });
  }
};

// 🧠 AI Dashboard Suggestions
exports.getAISuggestions = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ deadline: 1 });

    if (!tasks.length) {
      return res.json({
        success: true,
        suggestions: [
          { type: "info", icon: "📝", text: "No tasks yet — add your first task to get personalized AI suggestions!" },
        ],
      });
    }

    const now = new Date();
    const overdue = tasks.filter((t) => !t.completed && new Date(t.deadline) < now);
    const dueToday = tasks.filter((t) => {
      const d = new Date(t.deadline);
      return !t.completed && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    });
    const dueSoon = tasks.filter((t) => {
      const diff = new Date(t.deadline) - now;
      return !t.completed && diff > 0 && diff <= 3 * 86400000;
    });
    const completed = tasks.filter((t) => t.completed);
    const pending = tasks.filter((t) => !t.completed);
    const hardPending = pending.filter((t) => Number(t.difficulty) >= 4);

    const suggestions = [];
    if (overdue.length) {
      suggestions.push({ type: "urgent", text: `⚠️ "${overdue[0].subject}" is overdue — tackle it first thing today.` });
    }
    if (dueToday.length) {
      suggestions.push({ type: "warning", text: `📅 "${dueToday[0].subject}" is due today — don't leave it for the last hour.` });
    }
    if (hardPending.length) {
      suggestions.push({ type: "tip", text: `🧩 "${hardPending[0].subject}" is marked hard — break it into 25-min focused blocks.` });
    }
    if (dueSoon.length) {
      suggestions.push({ type: "warning", text: `⏰ "${dueSoon[0].subject}" is due in under 3 days — start your revision now.` });
    }
    if (completed.length >= 3) {
      suggestions.push({ type: "motivate", text: `🔥 You've completed ${completed.length} tasks — great momentum, keep pushing!` });
    } else {
      suggestions.push({ type: "motivate", text: `💪 Consistency beats intensity — even 30 minutes today counts.` });
    }

    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error("AI Suggestions Error:", err);
    return res.status(500).json({ error: "Failed to generate suggestions" });
  }
};

// 💬 Local Study Chat Assistant
exports.chatAssistant = async (req, res) => {
  try {
    const { message, taskId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    let task = null;
    if (taskId) {
      task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
    }

    const answer = generateLocalChatResponse({ userMessage: message.trim(), task });
    return res.json({
      success: true,
      response: answer,
      model: "local-study-coach",
      taskId: task?._id || null,
    });
  } catch (err) {
    console.error("Chat Assistant Error:", err);
    return res.status(500).json({ error: "Failed to generate chatbot response" });
  }
};

// 📲 Send FCM push notifications for task alerts
exports.sendTaskPushNotification = async (req, res) => {
  try {
    const { taskId, alertType } = req.body;

    if (!taskId || !alertType) {
      return res.status(400).json({ error: "taskId and alertType are required" });
    }

    const validTypes = ["today", "1h", "overdue"];
    if (!validTypes.includes(alertType)) {
      return res.status(400).json({ error: "Invalid alertType" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const dedupeKey = `${taskId}-${alertType}`;
    const now = Date.now();
    const lastSent = smsDedupeCache.get(dedupeKey) || 0;

    if (now - lastSent < 30 * 60 * 1000) {
      return res.json({ success: true, skipped: true, reason: "duplicate-window" });
    }

    const dueDateText = new Date(task.deadline).toLocaleString();
    const title =
      alertType === "overdue"
        ? "Overdue Alert"
        : alertType === "1h"
          ? "1-Hour Reminder"
          : "Due Today Reminder";

    const body = `${task.subject} (${task.difficulty}) is due ${dueDateText}.`;
    const result = await sendFCMNotification({
      title,
      body,
      data: {
        taskId: String(task._id),
        alertType,
        deadline: String(task.deadline),
      },
    });

    if (result.successCount > 0) {
      smsDedupeCache.set(dedupeKey, now);
    }

    return res.json({
      success: result.successCount > 0,
      sentCount: result.successCount,
      failedCount: result.failureCount,
    });
  } catch (err) {
    console.error("Send Task Push Error:", err);
    return res.status(500).json({ error: "Failed to send task push notifications" });
  }
};

// 📳 Register a browser FCM device token into MongoDB
exports.registerDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return res.status(400).json({ error: "token is required" });
    }

    await DeviceToken.findOneAndUpdate(
      { token: token.trim() },
      { token: token.trim() },
      { upsert: true, new: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Register Device Token Error:", err);
    return res.status(500).json({ error: "Failed to register device token" });
  }
};
