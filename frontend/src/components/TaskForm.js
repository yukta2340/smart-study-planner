
import React, { useState } from "react";
import { addTask, uploadTaskImage } from "../services/api";

function TaskForm({ refreshTasks }) {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    deadline: "",
    priority: "Medium",
  });
  const [taskImage, setTaskImage] = useState(null);
  const [markUploadedAsCompleted, setMarkUploadedAsCompleted] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject || !form.deadline) {
      alert("Please fill subject and deadline.");
      return;
    }

    try {
      await addTask({
        title: form.subject,
        description: form.description,
        deadline: form.deadline,
        priority: form.priority,
      });

      alert("Task Added ✅");

      setForm({
        subject: "",
        description: "",
        deadline: "",
        priority: "Medium",
      });

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

      <form onSubmit={handleSubmit} className="task-form">
        <div className="task-form-field">
          <label htmlFor="task-subject">Subject (e.g. Math)</label>
          <input
            id="task-subject"
            type="text"
            placeholder="Enter subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </div>

        <div className="task-form-field">
          <label htmlFor="task-description">Description (optional)</label>
          <textarea
            id="task-description"
            placeholder="Enter task description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows="4"
          />
        </div>

        <div className="task-form-row">
          <div className="task-form-field">
            <label htmlFor="task-deadline">Deadline</label>
            <input
              id="task-deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          <div className="task-form-field">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        <button type="submit" className="primary-btn">Add Task</button>
      </form>

      <div className="task-image-upload">
        <h3>Upload Task Pic (AI OCR)</h3>
        <p className="upload-copy">
          Drag and drop a task image or click to upload. Supported formats: PNG, JPG, JPEG.
        </p>

        <div
          className={`upload-dropzone ${dragActive ? "active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer?.files?.[0];
            if (file) setTaskImage(file);
          }}
        >
          <span className="upload-dropzone-text">
            {taskImage ? taskImage.name : "Drag & drop or click to upload"}
          </span>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => setTaskImage(e.target.files?.[0] || null)}
          />
        </div>

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
          className="secondary-btn"
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