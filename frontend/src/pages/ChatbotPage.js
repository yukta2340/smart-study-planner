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
            <TaskList tasks={tasks} refreshTasks={fetchTasks} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
