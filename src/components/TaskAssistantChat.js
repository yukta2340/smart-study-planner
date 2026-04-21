import React, { useMemo, useState } from "react";
import { chatWithAssistant } from "../services/api";

function TaskAssistantChat({ tasks = [] }) {
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I can explain tasks, break difficult problems, and give you a normal study plan for your work.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const selectedTask = useMemo(
    () => tasks.find((t) => t._id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const handleAsk = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      alert("Type your question for the AI assistant.");
      return;
    }

    try {
      setLoading(true);
      const userText = question.trim();
      const nextMessages = [...messages, { role: "user", content: userText }];
      setMessages(nextMessages);
      setQuestion("");

      const { data } = await chatWithAssistant({
        taskId: selectedTaskId || undefined,
        message: userText,
        history: nextMessages,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.response || "No response from assistant.",
        },
      ]);
    } catch (error) {
      console.error("Task assistant failed:", error);
      const serverMessage =
        error?.response?.data?.error || "AI assistant is unavailable right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: serverMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat reset done. Ask anything about your study task.",
      },
    ]);
  };

  return (
    <div className="assistant-container">
      <h2>AI Task Assistant</h2>
      <p className="assistant-subtitle">Ask for clear explanations, solving strategy, and better ways to handle difficult tasks.</p>

      <form className="assistant-form" onSubmit={handleAsk}>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
        >
          <option value="">Select a task (optional)</option>
          {tasks.map((task) => (
            <option key={task._id} value={task._id}>
              {task.subject} | difficulty {task.difficulty}
            </option>
          ))}
        </select>

        <textarea
          rows="3"
          placeholder="Example: Explain this task and give me a normal study plan"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <div className="assistant-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
          <button type="button" className="assistant-clear" onClick={handleClearChat}>
            Clear Chat
          </button>
        </div>
      </form>

      {selectedTask && (
        <p className="assistant-task-meta">
          Selected: {selectedTask.subject} | Deadline: {new Date(selectedTask.deadline).toLocaleString()}
        </p>
      )}

      <div className="assistant-chat-window">
        {messages.map((msg, idx) => (
          <div
            key={`${msg.role}-${idx}`}
            className={`assistant-message ${msg.role === "user" ? "user" : "bot"}`}
          >
            <pre>{msg.content}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskAssistantChat;
