import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TaskAssistantChat from "../components/TaskAssistantChat";
import { getTasks } from "../services/api";

// Styles
import "../styles/chatbot.css";

function ChatbotPage() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks();
        setTasks(response.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setTasks([]);
      }
    };

    fetchTasks();
  }, []);

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
