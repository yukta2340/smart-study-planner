import React, { useEffect, useState } from "react";
import { useAppAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskAssistantChat from "../components/TaskAssistantChat";
import { getTasks } from "../services/api";

// Styles
import "../styles/chatbot.css";

function ChatbotPage() {
  const [tasks, setTasks] = useState([]);
  const { isAuthenticated, user } = useAppAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!isAuthenticated) {
        console.log("⏳ Not authenticated yet, skipping task fetch in ChatbotPage");
        setTasks([]);
        return;
      }

      console.log("📥 Fetching tasks in ChatbotPage for user:", user?._id);
      try {
        const response = await getTasks();
        // Handle standardized response structure
        const tasksData = response.data?.data || response.data || [];
        console.log("✅ Tasks fetched in ChatbotPage:", tasksData.length, "tasks");
        setTasks(tasksData);
      } catch (err) {
        console.error("❌ Error fetching tasks in ChatbotPage:", err.response?.status, err.response?.data || err.message);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [isAuthenticated, user]);

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      <div className="chatbot-page-container">
        <div className="chatbot-hero">
          <div className="hero-badge">
            <span>🤖 AI Powered</span>
          </div>
          <h1>
            AI <span className="text-gradient">Study Coach</span>
          </h1>
          <p className="chatbot-subtitle">Ask me anything about your tasks and I'll help you study smarter with personalized insights and strategies.</p>
        </div>

        <TaskAssistantChat tasks={tasks} />
      </div>
    </div>
  );
}

export default ChatbotPage;
