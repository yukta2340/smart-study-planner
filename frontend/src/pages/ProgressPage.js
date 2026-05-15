import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { getTasks } from "../services/api";
import Navbar from "../components/Navbar";
import ProgressChart from "../components/ProgressChart";
import "../styles/dashboard.css";

function ProgressPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAppAuth();
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await getTasks();
      setTasks(response.data.data || []);
    } catch (err) {
      console.error("ProgressPage load error:", err);
      setError("Unable to load progress data right now.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const efficiency = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const topPending = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className="planner-page">
      <Navbar />

      <div className="dashboard-container">
        <header className="planner-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontWeight: 700, fontSize: '2.6rem', marginBottom: '0.75rem' }}>
            📈 My Progress
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.15rem', maxWidth: '720px', lineHeight: 1.7 }}>
            This page shows your study progress using your current task inputs. Review your completion rate, weekly task activity, and focus tasks that need attention.
          </p>
        </header>

        {loading ? (
          <div className="loading-state">Loading your progress data...</div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}

            <section className="stat-grid">
              <div className="glass-card">
                <div className="metric-card-header">
                  <span className="metric-icon total-icon">📋</span>
                  <div>
                    <p className="metric-label">Total Tasks</p>
                    <h3>{totalTasks}</h3>
                  </div>
                </div>
                <p className="metric-note">All assigned tasks</p>
              </div>
              <div className="glass-card">
                <div className="metric-card-header">
                  <span className="metric-icon completed-icon">✅</span>
                  <div>
                    <p className="metric-label">Completed</p>
                    <h3>{completedTasks}</h3>
                  </div>
                </div>
                <p className="metric-note">{totalTasks ? `${Math.round((completedTasks / totalTasks) * 100)}% of total tasks` : 'No tasks yet'}</p>
              </div>
              <div className="glass-card">
                <div className="metric-card-header">
                  <span className="metric-icon pending-icon">⏳</span>
                  <div>
                    <p className="metric-label">Pending</p>
                    <h3>{pendingTasks}</h3>
                  </div>
                </div>
                <p className="metric-note">{totalTasks ? `${Math.round((pendingTasks / totalTasks) * 100)}% of total tasks` : 'No tasks yet'}</p>
              </div>
              <div className="glass-card highlight-card">
                <div className="metric-card-header">
                  <span className="metric-icon efficiency-icon">🚀</span>
                  <div>
                    <p className="metric-label">Efficiency</p>
                    <h3>{efficiency}%</h3>
                  </div>
                </div>
                <p className="metric-note">Your productivity score</p>
              </div>
            </section>

            <section className="chart-grid">
              <div className="glass-card">
                <ProgressChart tasks={tasks} showStats={false} />
              </div>

              <div className="glass-card progress-overview-card">
                <div className="overview-header-row">
                  <div>
                    <h2>Task Overview</h2>
                    <p>Summary of your current progress.</p>
                  </div>
                  <button className="nav-link-btn" type="button" onClick={() => navigate('/planner')}>
                    View All Tasks
                  </button>
                </div>

                <div className="progress-donut-card">
                  <div className="progress-donut" style={{ '--percent': efficiency }}>
                    <div className="progress-donut-center">
                      <strong>{efficiency}%</strong>
                      <span>Completed</span>
                    </div>
                  </div>

                  <div className="donut-legends">
                    <div className="donut-legend-item">
                      <span className="legend-dot completed-dot" />
                      <div>
                        <p>Completed</p>
                        <strong>{completedTasks} ({totalTasks ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'})</strong>
                      </div>
                    </div>
                    <div className="donut-legend-item">
                      <span className="legend-dot pending-dot" />
                      <div>
                        <p>Pending</p>
                        <strong>{pendingTasks} ({totalTasks ? `${Math.round((pendingTasks / totalTasks) * 100)}%` : '0%'})</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overview-summary-text">
                  <p>Great progress! Keep it up, Scholar. Focus on the next deadlines to maintain momentum.</p>
                </div>
              </div>
            </section>

            <section className="glass-card progress-upcoming-card">
              <div className="progress-upcoming-header">
                <div>
                  <h2>Upcoming Tasks</h2>
                  <p>Pending tasks by deadline.</p>
                </div>
                <span>{topPending.length} tasks</span>
              </div>

              {topPending.length === 0 ? (
                <p className="empty">No pending tasks found. Add a new task and watch your progress grow.</p>
              ) : (
                <div className="progress-task-table-wrapper">
                  <table className="progress-task-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPending.map((task) => (
                        <tr key={task._id}>
                          <td className="task-name-cell">
                            <strong>{task.title || task.subject || 'Untitled task'}</strong>
                            <span>{task.description ? task.description.slice(0, 80) + (task.description.length > 80 ? '...' : '') : 'No description'}</span>
                          </td>
                          <td>{task.subject || 'General'}</td>
                          <td><span className={`task-chip ${task.priority?.toLowerCase() || 'pending'}`}>{task.priority || 'Medium'}</span></td>
                          <td>{task.deadline ? new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No deadline'}</td>
                          <td><span className="status-chip">Pending</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="progress-footer-banner">
              <p>“Progress is progress, no matter how small.” Keep pushing forward!</p>
            </div>
          </>
          </>
        )}
      </div>
    </div>
  );
}

export default ProgressPage;
