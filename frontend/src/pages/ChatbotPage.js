import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskAssistantChat from "../components/TaskAssistantChat";
import TaskList from "../components/TaskList";
import { getTasks } from "../services/api";

// Styles
import "../styles/chatbot.css";

function ChatbotPage() {
  const [tasks, setTasks] = useState([]);
  const { isAuthenticated, user } = useAppAuth();
  const navigate = useNavigate();

  const getStatusKey = (task) => {
    const status = String(task.status || "").toLowerCase();
    if (status === "in progress" || status === "inprogress") return "in progress";
    if (status === "completed") return "completed";
    if (status === "pending") return "pending";
    return task.completed ? "completed" : "pending";
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((task) => getStatusKey(task) === "pending").length,
    inProgress: tasks.filter((task) => getStatusKey(task) === "in progress").length,
    completed: tasks.filter((task) => getStatusKey(task) === "completed").length,
  };

  const fetchTasks = async () => {
    if (!isAuthenticated) {
      console.log("⏳ Not authenticated yet, skipping task fetch in ChatbotPage");
      setTasks([]);
      return;
    }

    console.log("📥 Fetching tasks in ChatbotPage for user:", user?._id);
    try {
      const response = await getTasks();
      const tasksData = response.data?.data || response.data || [];
      console.log("✅ Tasks fetched in ChatbotPage:", tasksData.length, "tasks");
      setTasks(tasksData);
    } catch (err) {
      console.error("❌ Error fetching tasks in ChatbotPage:", err.response?.status, err.response?.data || err.message);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [isAuthenticated, user]);

  return (
    <div>
      <Navbar />

      <div className="chatbot-page-container">
        <div className="chatbot-hero">
          <div className="hero-badge">
            <span>🤖 AI Powered</span>
          </div>
          <h1>
            AI <span className="text-gradient">Study Coach</span>
          </h1>
          <p className="chatbot-subtitle">
            Ask me anything about your tasks and I’ll help you study smarter with personalized insights and practical next steps.
          </p>
        </div>

        <div className="chatbot-grid">
            <div className="assistant-panel">
            <div className="assistant-panel-top">
              <span className="panel-label">Study Coach</span>
              <h2>Ask the AI for smarter study steps</h2>
              <p className="assistant-panel-copy">
                Select a task, ask a question, and get concise guidance with clearer priorities and planning cues.
              </p>
            </div>
            <TaskAssistantChat tasks={tasks} />
          </div>

          <div className="tasks-panel">
            <div className="tasks-panel-header">
              <div>
                <span className="panel-label">Your Tasks</span>
                <h2>Manage and track your study work</h2>
              </div>
              <div className="tasks-panel-actions">
                <button type="button" className="primary-btn" onClick={() => navigate('/planner')}>
                  + Add Task
                </button>
                <select className="sort-select" defaultValue="due">
                  <option value="due">Sort by: Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            <div className="tasks-panel-stats">
              <div className="summary-card">
                <span>Tasks</span>
                <strong>{taskStats.total}</strong>
              </div>
              <div className="summary-card">
                <span>Pending</span>
                <strong>{taskStats.pending}</strong>
              </div>
              <div className="summary-card">
                <span>In Progress</span>
                <strong>{taskStats.inProgress}</strong>
              </div>
              <div className="summary-card">
                <span>Completed</span>
                <strong>{taskStats.completed}</strong>
              </div>
            </div>

            <TaskList tasks={tasks} refreshTasks={fetchTasks} showHeader={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
