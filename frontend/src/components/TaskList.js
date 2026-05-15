import React, { useState, useMemo } from "react";
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

function TaskList({ tasks = [], refreshTasks, showHeader = true }) {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  const normalizeStatus = (task) => {
    const raw = task.status?.toLowerCase();
    if (raw === "in progress" || raw === "inprogress") return "in progress";
    if (raw === "completed") return "completed";
    if (raw === "pending") return "pending";
    return task.completed ? "completed" : "pending";
  };

  const filteredTasks = useMemo(
    () => tasks.filter((task) => {
      if (filter === "all") return true;
      return normalizeStatus(task) === filter;
    }),
    [tasks, filter]
  );

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.deadline || 0) - new Date(b.deadline || 0);
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return 0;
    });
  }, [filteredTasks, sortBy]);

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
      <div className="task-list-header">
        <div>
          <h2 className="task-list-title">
            <i className="fa fa-list task-list-title-icon"></i>
            Your Tasks
          </h2>
          <p className="task-list-subtitle">All your tasks in one place.</p>
        </div>
        <div className="task-list-actions">
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
          <div className="sort-panel">
            <label htmlFor="sort-tasks">Sort by</label>
            <select
              id="sort-tasks"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dueDate">Due Date</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="empty">
          {tasks.length === 0
            ? 'No tasks available. Add one!'
            : 'No tasks match this filter.'}
        </p>
      ) : (
        sortedTasks.map((task) => (
          <div className="task-item" key={task._id}>
            <div className="task-item-top">
              <div className="task-item-summary">
                <div className="task-item-icon">{(task.subject || task.title || "T").charAt(0).toUpperCase()}</div>
                <div>
                  <div className="task-item-title-container">
                    <h3 className={`task-item-title ${task.completed ? "done" : ""}`}>
                      {task.title || task.subject}
                    </h3>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <p className="task-item-subtitle">
                    {task.description || task.topic || "No additional details."}
                  </p>
                </div>
              </div>
              <div className="task-item-status">
                {getStatusBadge(task.status || (task.completed ? "Completed" : "Pending"))}
              </div>
            </div>
            <div className="task-card-footer">
              <div className="task-due">{formatDue(task)}</div>
              <div className="task-actions">
                <label className="task-complete-toggle">
                  <input
                    type="checkbox"
                    checked={task.completed || false}
                    onChange={() => handleToggle(task)}
                  />
                  <span>Done</span>
                </label>
                <button className="delete-btn" onClick={() => handleDelete(task._id)} title="Delete task">
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TaskList;