import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
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
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppAuth();

  const notifyTask = useCallback((title, body, dedupeKey, smsPayload = null) => {
    const now = Date.now();
    const last = notifiedAtRef.current.get(dedupeKey) || 0;

    if (now - last < 30 * 60 * 1000) return;
    notifiedAtRef.current.set(dedupeKey, now);

    setToast({ title, body, id: now });

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body });
      } catch (_err) {}
    }

    if (smsPayload?.taskId && smsPayload?.alertType) {
      notifyTaskPush(smsPayload.taskId, smsPayload.alertType).catch(() => {});
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await getTasks();
      setTasks(response.data.data || []); // Our new helper wraps data in 'data' field
    } catch (err) {
      console.error("❌ Error fetching tasks:", err.message);
      setTasks([]);
    }
  }, [isAuthenticated]);

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
            `${task.title} is overdue.`,
            `${task._id}-overdue`,
            { taskId: task._id, alertType: "overdue" }
          );
          return;
        }

        if (msLeft <= 60 * 60 * 1000) {
          notifyTask(
            "Task Due In 1 Hour",
            `${task.title} is due within the hour.`,
            `${task._id}-1h`,
            { taskId: task._id, alertType: "1h" }
          );
          return;
        }

        if (msLeft <= 24 * 60 * 60 * 1000) {
          notifyTask(
            "Task Due Today",
            `${task.title} is due today.`,
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
    <div className="planner-page">
      <Navbar />

      {toast && (
        <div className="task-notify-toast" key={toast.id} role="status" aria-live="polite">
          <div className="task-notify-title">{toast.title}</div>
          <div className="task-notify-body">{toast.body}</div>
        </div>
      )}

      <div className="dashboard-container">
        {/* Dashboard Section */}
        {activeSection === "dashboard" && (
          <>
            <DashboardOverview tasks={tasks} />
          </>
        )}

        {/* Tasks Section */}
        {activeSection === "tasks" && (
          <>
            <header className="planner-header" style={{ marginBottom: '3rem' }}>
              <h1 style={{ fontWeight: 700, fontSize: '2.8rem', marginBottom: '0.8rem' }}>
                <i className="fa fa-tasks" style={{ color: '#6366f1', marginRight: 12, fontSize: '2.4rem' }}></i>
                Manage Your <span className="text-gradient">Tasks</span>
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1.25rem', marginBottom: 0 }}>Organize your study tasks and stay on track with AI-powered insights.</p>
            </header>

            <div className="task-main-grid">
              <div className="glass-card task-form-glass">
                <TaskForm refreshTasks={fetchTasks} />
              </div>
              <div className="glass-card task-list-glass">
                <TaskList tasks={tasks} refreshTasks={fetchTasks} />
              </div>
            </div>

            <div className="task-pro-tip">
              <span className="pro-tip-icon">💡</span>
              <span className="pro-tip-title">Pro Tip</span>
              <span className="pro-tip-text">Break large tasks into smaller steps and set deadlines to stay consistent!</span>
            </div>
          </>
        )}

        {/* Progress Section */}
        {activeSection === "progress" && (
          <>
            <ProgressChart tasks={tasks} />
          </>
        )}

        {/* Calendar Section */}
        {activeSection === "calendar" && (
          <>
            <CalendarView tasks={tasks} />
          </>
        )}
      </div>
    </div>
  );
}

export default Planner;