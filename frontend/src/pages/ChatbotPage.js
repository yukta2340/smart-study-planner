import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import TaskAssistantChat from "../components/TaskAssistantChat";
import { getTasks } from "../services/api";

// Styles
import "../styles/chatbot.css";

function ChatbotPage() {
  const [tasks, setTasks] = useState([]);
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!isSignedIn) {
        console.log("⏳ Not signed in yet, skipping task fetch in ChatbotPage");
        setTasks([]);
        return;
      }

      console.log("📥 Fetching tasks in ChatbotPage for user:", userId);
      try {
        const response = await getTasks();
        console.log("✅ Tasks fetched in ChatbotPage:", response.data.length, "tasks");
        setTasks(response.data);
      } catch (err) {
        console.error("❌ Error fetching tasks in ChatbotPage:", err.response?.status, err.response?.data || err.message);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [isSignedIn, userId]);

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      <div className="chatbot-page-container">
        <div className="chatbot-hero">
          <h1>🤖 AI Study Coach</h1>
          <p>Ask me anything about your tasks and I'll help you study smarter.</p>
        </div>

        <TaskAssistantChat tasks={tasks} />
      </div>
    </div>
  );
}

export default ChatbotPage;
