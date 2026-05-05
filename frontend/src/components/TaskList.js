import React, { useState } from "react";
import { updateTask, deleteTask } from "../services/api";

function getPriorityBadge(priority) {
  if (!priority) return null;
  const p = priority.toLowerCase();
  if (p === "high") return <span className="badge badge-high">High</span>;
  if (p === "medium") return <span className="badge badge-medium">Medium</span>;
  if (p === "low") return <span className="badge badge-low">Low</span>;
  return null;
}
function getStatusBadge(status) {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "pending") return <span className="badge badge-pending">Pending</span>;
  if (s === "in progress" || s === "inprogress") return <span className="badge badge-inprogress">In Progress</span>;
  if (s === "completed") return <span className="badge badge-completed">Completed</span>;
  return null;
}

function formatDue(task) {
  if (task.completed && task.completedAt) {
    return `Completed on ${new Date(task.completedAt).toLocaleDateString()}`;
  }
  if (!task.deadline) return "No due date";
  const due = new Date(task.deadline);
  const now = new Date();
  const isToday = due.toDateString() === now.toDateString();
  if (isToday) return `Due: Today, ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return `Due: ${due.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function TaskList({ tasks = [], refreshTasks }) {
  const [filter, setFilter] = useState("all");

  const normalizeStatus = (task) => {
    const raw = task.status?.toLowerCase();
    if (raw === "in progress" || raw === "inprogress") return "in progress";
    if (raw === "completed") return "completed";
    if (raw === "pending") return "pending";
    return task.completed ? "completed" : "pending";
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return normalizeStatus(task) === filter;
  });

  const getCount = (status) => tasks.filter((task) => normalizeStatus(task) === status).length;

  // Toggle Complete Status
  const handleToggle = async (task) => {
    try {
      await updateTask(task._id, { completed: !task.completed });
      refreshTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      refreshTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="task-list-container">
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.3rem' }}>
        <i className="fa fa-list" style={{ color: '#6366f1', marginRight: 8 }}></i>
        Your Tasks
      </h2>

      <div className="status-filters">
        {[
          { label: 'All', value: 'all' },
          { label: 'Pending', value: 'pending' },
          { label: 'In Progress', value: 'in progress' },
          { label: 'Completed', value: 'completed' },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            className={`status-filter-btn ${filter === item.value ? 'active' : ''}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
            {item.value !== 'all' && <span className="status-filter-count">{getCount(item.value)}</span>}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <p className="empty">
          {tasks.length === 0
            ? 'No tasks available. Add one!'
            : 'No tasks match this filter.'}
        </p>
      ) : (
        filteredTasks.map((task) => (
          <div className="task-item" key={task._id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 120 }}>
              {getPriorityBadge(task.priority)}
              {getStatusBadge(task.status || (task.completed ? 'Completed' : 'Pending'))}
            </div>
            <div className="task-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: '1.08rem' }} className={task.completed ? "done" : ""}>{task.title || task.subject}</span>
              </div>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              <div style={{ color: '#a5b4fc', fontSize: '0.98rem', margin: '0.25rem 0 0.5rem 0' }}>{task.topic || task.topics}</div>
              <div style={{ color: '#a5b4fc', fontSize: '0.98rem' }}>{formatDue(task)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={task.completed || false}
                onChange={() => handleToggle(task)}
                style={{ width: 20, height: 20, accentColor: '#6366f1' }}
                title="Mark as complete"
              />
              <button
                className="delete-btn"
                onClick={() => handleDelete(task._id)}
                title="Delete task"
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TaskList;