
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getTasks, notifyTaskPush } from "../services/api";

// Components
import Navbar from "../components/Navbar";
import DashboardOverview from "../components/DashboardOverview";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import ProgressChart from "../components/ProgressChart";
import CalendarView from "../components/CalendarView";

// Styles
import "../styles/dashboard.css";
import "../styles/calendar.css";

function Planner() {
  const [tasks, setTasks] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const notifiedAtRef = useRef(new Map());
  const location = useLocation();

  const notifyTask = useCallback((title, body, dedupeKey, smsPayload = null) => {
    const now = Date.now();
    const last = notifiedAtRef.current.get(dedupeKey) || 0;

    // Prevent repeated notifications too frequently.
    if (now - last < 30 * 60 * 1000) return;
    notifiedAtRef.current.set(dedupeKey, now);

    setToast({ title, body, id: now });

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body });
      } catch (_err) {
        // Ignore browser notification errors and keep in-app toast.
      }
    }

    if (smsPayload?.taskId && smsPayload?.alertType) {
      notifyTaskPush(smsPayload.taskId, smsPayload.alertType).catch(() => {});
    }
  }, []);

  // 📥 Fetch Tasks
  const fetchTasks = useCallback(async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]); // Set to empty array on error
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const evaluateNotifications = () => {
      const now = Date.now();

      tasks.forEach((task) => {
        if (task.completed) return;

        const deadlineTs = new Date(task.deadline).getTime();
        if (Number.isNaN(deadlineTs)) return;

        const msLeft = deadlineTs - now;

        if (msLeft <= 0) {
          notifyTask(
            "Task Overdue",
            `${task.subject} is overdue. Please complete it as soon as possible.`,
            `${task._id}-overdue`,
            { taskId: task._id, alertType: "overdue" }
          );
          return;
        }

        if (msLeft <= 60 * 60 * 1000) {
          notifyTask(
            "Task Due In 1 Hour",
            `${task.subject} is due within the next hour.`,
            `${task._id}-1h`,
            { taskId: task._id, alertType: "1h" }
          );
          return;
        }

        if (msLeft <= 24 * 60 * 60 * 1000) {
          notifyTask(
            "Task Due Today",
            `${task.subject} is due today. Keep it in focus.`,
            `${task._id}-today`,
            { taskId: task._id, alertType: "today" }
          );
        }
      });
    };

    evaluateNotifications();
    const id = setInterval(evaluateNotifications, 60 * 1000);
    return () => clearInterval(id);
  }, [tasks, notifyTask]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const sectionId = location.hash.replace("#", "") || "dashboard";
    const validSections = ["dashboard", "tasks", "progress", "calendar"];
    setActiveSection(validSections.includes(sectionId) ? sectionId : "dashboard");
  }, [location.hash]);

  return (
    <div>

      {/* Navbar */}
      <Navbar />

      {toast && (
        <div className="task-notify-toast" key={toast.id} role="status" aria-live="polite">
          <div className="task-notify-title">{toast.title}</div>
          <div className="task-notify-body">{toast.body}</div>
        </div>
      )}

      <div className="dashboard-container">

        {activeSection === "dashboard" && (
          <section id="dashboard" className="planner-section">
            <h1 style={{ marginBottom: "24px" }}>📊 Smart Study Dashboard</h1>
            <DashboardOverview tasks={tasks} />
          </section>
        )}

        {activeSection === "tasks" && (
          <section id="tasks" className="planner-section">
            <TaskForm refreshTasks={fetchTasks} />
            <TaskList tasks={tasks} refreshTasks={fetchTasks} />
          </section>
        )}

        {activeSection === "progress" && (
          <section id="progress" className="planner-section">
            <ProgressChart tasks={tasks} />
          </section>
        )}

        {activeSection === "calendar" && (
          <section id="calendar" className="planner-section">
            <CalendarView tasks={tasks} refreshTasks={fetchTasks} />
          </section>
        )}

      </div>

    </div>
  );
}

export default Planner;