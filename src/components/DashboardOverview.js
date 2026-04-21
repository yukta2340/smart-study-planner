import React, { useState, useEffect } from "react";
import { getAISuggestions } from "../services/api";

function msUntil(deadline) {
  return new Date(deadline).getTime() - Date.now();
}

function formatCountdown(ms) {
  if (ms <= 0) return "Overdue";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

function urgencyClass(ms) {
  if (ms <= 0) return "urgency-overdue";
  if (ms < 86400000) return "urgency-critical";
  if (ms < 3 * 86400000) return "urgency-warning";
  return "urgency-ok";
}

// Progress % of time elapsed between task creation and deadline (capped 0-100)
function timeProgress(task) {
  const created = new Date(task.createdAt || task.deadline).getTime() - 7 * 86400000;
  const deadline = new Date(task.deadline).getTime();
  const total = deadline - created;
  if (total <= 0) return 100;
  const elapsed = Date.now() - created;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const DIFF_META = {
  easy:   { label: "Easy",   color: "#4ecdc4", bg: "rgba(78,205,196,0.15)" },
  medium: { label: "Medium", color: "#f6c90e", bg: "rgba(246,201,14,0.15)" },
  hard:   { label: "Hard",   color: "#ff4d4d", bg: "rgba(255,77,77,0.15)"  },
};

const SUG_ICON = {
  urgent:   "🚨",
  warning:  "⚠️",
  tip:      "💡",
  motivate: "🔥",
  info:     "ℹ️",
};

function DiffPill({ difficulty }) {
  const key = (difficulty || "").toLowerCase();
  const meta = DIFF_META[key] || { label: difficulty, color: "#667eea", bg: "rgba(102,126,234,0.15)" };
  return (
    <span
      className="dash-diff-pill"
      style={{ color: meta.color, background: meta.bg, borderColor: meta.color }}
    >
      {meta.label}
    </span>
  );
}

function DashboardOverview({ tasks = [] }) {
  const [, setTick] = useState(0);
  const [suggestions, setSuggestions]   = useState([]);
  const [sugLoading, setSugLoading]     = useState(false);
  const [sugFetched, setSugFetched]     = useState(false);
  const [taskView, setTaskView]         = useState("pending");

  // Live countdown tick
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch AI suggestions once tasks are loaded
  useEffect(() => {
    if (tasks.length === 0 || sugFetched) return;
    setSugLoading(true);
    setSugFetched(true);
    getAISuggestions()
      .then(({ data }) => setSuggestions(data.suggestions || []))
      .catch(() => setSuggestions([
        { type: "tip", text: "AI suggestions unavailable right now. Make sure your server is running." },
      ]))
      .finally(() => setSugLoading(false));
  }, [tasks, sugFetched]);

  const refreshSuggestions = () => {
    setSugFetched(false);
    setSuggestions([]);
  };

  const total     = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending   = total - completed;
  const overdueTasks = tasks.filter((t) => !t.completed && msUntil(t.deadline) <= 0);
  const completePct  = total ? Math.round((completed / total) * 100) : 0;

  const todayTasks = tasks.filter((t) => isToday(t.deadline));

  const allByDeadline = [...tasks].sort(
    (a, b) => new Date(a.deadline) - new Date(b.deadline)
  );

  const filteredTasks = allByDeadline.filter((t) => {
    const ms = msUntil(t.deadline);
    if (taskView === "all") return true;
    if (taskView === "pending") return !t.completed;
    if (taskView === "completed") return t.completed;
    if (taskView === "overdue") return !t.completed && ms <= 0;
    if (taskView === "today") return isToday(t.deadline);
    return true;
  });

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  const STAT_CARDS = [
    { label: "Total Tasks",  value: total,              icon: "📚", accent: "#667eea", pct: 100 },
    { label: "Completed",    value: completed,           icon: "✅", accent: "#4ecdc4", pct: completePct },
    { label: "Pending",      value: pending,             icon: "⏳", accent: "#f6c90e", pct: total ? Math.round((pending / total) * 100) : 0 },
    { label: "Overdue",      value: overdueTasks.length, icon: "🚨", accent: "#ff4d4d", pct: total ? Math.round((overdueTasks.length / total) * 100) : 0 },
  ];

  return (
    <div className="dash-overview">

      {/* ── Welcome banner ── */}
      <div className="dash-welcome">
        <div className="dash-welcome-left">
          <h2 className="dash-greeting">{getGreeting()} 👋</h2>
          <p className="dash-date">{today}</p>
        </div>
        <div className="dash-welcome-right">
          <div className="dash-ring-wrap">
            <svg viewBox="0 0 56 56" className="dash-ring-svg">
              <circle cx="28" cy="28" r="24" className="dash-ring-bg" />
              <circle
                cx="28" cy="28" r="24"
                className="dash-ring-fill"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - completePct / 100)}`}
              />
            </svg>
            <span className="dash-ring-label">{completePct}%</span>
          </div>
          <p className="dash-ring-caption">Done</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash-stat-row">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="dash-stat-card"
            style={{ "--card-accent": card.accent }}
          >
            <div className="dash-stat-icon-wrap">
              <span className="dash-stat-icon">{card.icon}</span>
            </div>
            <div className="dash-stat-body">
              <p className="dash-stat-value">{card.value}</p>
              <p className="dash-stat-label">{card.label}</p>
              <div className="dash-stat-bar">
                <div
                  className="dash-stat-bar-fill"
                  style={{ width: `${card.pct}%`, background: card.accent }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-panel row ── */}
      <div className="dash-panels">

        {/* Today's Tasks */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">📅 Today's Tasks</h3>
            <span className="dash-panel-badge">{todayTasks.length}</span>
          </div>
          {todayTasks.length === 0 ? (
            <div className="dash-empty-state">
              <span className="dash-empty-icon">🎉</span>
              <p>No tasks due today — enjoy your day!</p>
            </div>
          ) : (
            <div className="dash-today-list">
              {todayTasks.map((t) => (
                <div
                  key={t._id}
                  className={`dash-today-card ${t.completed ? "dash-today-done" : ""}`}
                >
                  <div className="dash-today-status">
                    {t.completed
                      ? <span className="dash-status-check">✓</span>
                      : <span className="dash-status-dot" />}
                  </div>
                  <div className="dash-today-info">
                    <span className={`dash-today-name ${t.completed ? "done" : ""}`}>
                      {t.subject}
                    </span>
                    {t.description && (
                      <small className="dash-today-desc">{t.description}</small>
                    )}
                  </div>
                  <DiffPill difficulty={t.difficulty} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Tasks */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">🗂️ All Tasks</h3>
            <div className="dash-panel-controls">
              <select
                className="dash-task-filter"
                value={taskView}
                onChange={(e) => setTaskView(e.target.value)}
                aria-label="Filter tasks"
              >
                <option value="pending">Pending</option>
                <option value="all">All</option>
                <option value="today">Due Today</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
              <span className="dash-panel-badge">{filteredTasks.length}</span>
            </div>
          </div>
          {filteredTasks.length === 0 ? (
            <div className="dash-empty-state">
              <span className="dash-empty-icon">🎉</span>
              <p>No tasks in this filter.</p>
            </div>
          ) : (
            <div className="dash-deadline-list dash-deadline-list-scroll">
              {filteredTasks.map((t) => {
                const ms  = msUntil(t.deadline);
                const pct = t.completed ? 100 : timeProgress(t);
                const urg = t.completed ? "urgency-done" : urgencyClass(ms);
                return (
                  <div key={t._id} className={`dash-deadline-card ${urg}`}>
                    <div className="dash-deadline-top">
                      <span className="dash-deadline-subject">{t.subject}</span>
                      <span className={`dash-countdown ${urg}`}>
                        {t.completed ? "Completed" : formatCountdown(ms)}
                      </span>
                    </div>
                    <div className="dash-deadline-meta">
                      📅 {new Date(t.deadline).toLocaleDateString(undefined, {
                        weekday: "short", month: "short", day: "numeric",
                      })}
                    </div>
                    <div className="dash-time-bar">
                      <div
                        className={`dash-time-fill ${urg}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── AI Suggestions ── */}
      <div className="dash-ai-panel">
        <div className="dash-ai-header">
          <div className="dash-ai-title-row">
            <span className="dash-ai-spark">✨</span>
            <h3 className="dash-ai-title">AI Study Coach Suggestions</h3>
          </div>
          <button
            className="dash-ai-refresh"
            onClick={refreshSuggestions}
            disabled={sugLoading}
            title="Refresh suggestions"
          >
            {sugLoading ? "⏳" : "🔄"}
          </button>
        </div>

        {sugLoading ? (
          <div className="dash-ai-loading">
            <span className="dash-ai-loader" />
            <span>Analyzing your tasks...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="dash-empty-state">
            <span className="dash-empty-icon">🤖</span>
            <p>Add tasks to get personalized AI suggestions.</p>
          </div>
        ) : (
          <div className="dash-ai-list">
            {suggestions.map((s, i) => (
              <div key={i} className={`dash-ai-item dash-ai-${s.type}`}>
                <span className="dash-ai-item-icon">{SUG_ICON[s.type] || "💡"}</span>
                <p className="dash-ai-item-text">{s.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default DashboardOverview;
