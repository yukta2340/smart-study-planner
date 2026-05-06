
import React, { useState } from "react";
import { addTask, uploadTaskImage } from "../services/api";

function TaskForm({ refreshTasks }) {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    deadline: "",
    difficulty: "",
  });
  const [taskImage, setTaskImage] = useState(null);
  const [markUploadedAsCompleted, setMarkUploadedAsCompleted] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Basic validation
    if (!form.subject || !form.deadline || !form.difficulty) {
      alert("Please fill title, deadline, and difficulty");
      return;
    }

    try {
      await addTask({
        title: form.subject,
        description: form.description,
        deadline: form.deadline,
        difficulty: form.difficulty,
      });

      alert("Task Added ✅");

      // Reset form
      setForm({
        subject: "",
        description: "",
        deadline: "",
        difficulty: "",
      });

      // Refresh list (if passed)
      if (refreshTasks) refreshTasks();

    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Error adding task";
      alert(msg);
    }
  };

  const handleImageUpload = async () => {
    if (!taskImage) {
      alert("Please select a task image first.");
      return;
    }

    try {
      setIsUploadingImage(true);
      await uploadTaskImage(taskImage, markUploadedAsCompleted);
      alert("Task extracted from image and added ✅");
      setTaskImage(null);
      setMarkUploadedAsCompleted(false);
      if (refreshTasks) refreshTasks();
    } catch (err) {
      console.error(err);
      alert("Could not extract task from image. Please try a clearer image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="task-form-container">
      <div className="task-form-header">
        <h2>Your Task</h2>
        <p>Add your task details here and keep your study plan on track.</p>
      </div>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Task Title (e.g. Read Chapter 4)"
          value={form.subject}
          onChange={(e) =>
            setForm({ ...form, subject: e.target.value })
          }
        />

        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          rows="3"
        />

        <div className="deadline-field">
          <label htmlFor="task-deadline">Deadline</label>
          <input
            id="task-deadline"
            type="datetime-local"
            value={form.deadline}
            onChange={(e) =>
              setForm({ ...form, deadline: e.target.value })
            }
          />
        </div>

        <input
          type="number"
          placeholder="Difficulty (1-5)"
          min="1"
          max="5"
          value={form.difficulty}
          onChange={(e) =>
            setForm({ ...form, difficulty: e.target.value })
          }
        />

        <button type="submit">Add Task</button>
      </form>

      <div className="task-image-upload">
        <h3>Upload Task Pic (AI OCR)</h3>
        <p>
          Upload a photo/screenshot of your task. The system reads it and adds it to your task list automatically.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setTaskImage(e.target.files?.[0] || null)}
        />

        <label className="upload-completed-check">
          <input
            type="checkbox"
            className="upload-completed-check-input"
            checked={markUploadedAsCompleted}
            onChange={(e) => setMarkUploadedAsCompleted(e.target.checked)}
          />
          Mark uploaded task as completed
        </label>

        <button
          type="button"
          onClick={handleImageUpload}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? "Processing Image..." : "Upload and Add Task"}
        </button>
      </div>
    </div>
  );
}

export default TaskForm;