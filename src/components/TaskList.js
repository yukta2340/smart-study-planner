import React from "react";
import { updateTask, deleteTask } from "../services/api";

function TaskList({ tasks = [], refreshTasks }) {

  // ✅ Toggle Complete Status
  const handleToggle = async (task) => {
    try {
      await updateTask(task._id, { completed: !task.completed });
      refreshTasks(); // 🔥 refresh UI
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // ❌ Delete Task
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      refreshTasks(); // 🔥 refresh UI
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="task-list-container">

      <h2>📋 Your Tasks</h2>

      {tasks.length === 0 ? (
        <p className="empty">No tasks available. Add one!</p>
      ) : (
        tasks.map((task) => (
          <div className="task-item" key={task._id}>

            {/* Checkbox */}
            <input
              type="checkbox"
              checked={task.completed || false}
              onChange={() => handleToggle(task)}
            />

            {/* Task Info */}
            <div className="task-info">
              <span className={task.completed ? "done" : ""}>
                {task.subject}
              </span>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              <small>
                📅 {new Date(task.deadline).toLocaleDateString()} | ⚡ Difficulty: {task.difficulty}
              </small>
            </div>

            {/* Delete Button */}
            <button
              className="delete-btn"
              onClick={() => handleDelete(task._id)}
            >
              ❌
            </button>

          </div>
        ))
      )}

    </div>
  );
}

export default TaskList;