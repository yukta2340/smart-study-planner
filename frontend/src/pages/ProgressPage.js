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

            <section className="progress-page-grid">
              <div className="glass-card">
                <ProgressChart tasks={tasks} />
              </div>

              <aside className="glass-card progress-summary-card">
                <div>
                  <h2 style={{ marginBottom: '1rem' }}>Snapshot</h2>
                  <div className="progress-summary-list">
                    <div className="progress-summary-item">
                      <span>Total tasks</span>
                      <strong>{totalTasks}</strong>
                    </div>
                    <div className="progress-summary-item">
                      <span>Completed</span>
                      <strong>{completedTasks}</strong>
                    </div>
                    <div className="progress-summary-item">
                      <span>Pending</span>
                      <strong>{pendingTasks}</strong>
                    </div>
                    <div className="progress-summary-item">
                      <span>Overall efficiency</span>
                      <strong>{efficiency}%</strong>
                    </div>
                  </div>
                </div>

                <div className="progress-summary-banner">
                  <h3>Keep going!</h3>
                  <p>
                    Focus on the tasks with the soonest deadlines first, and use this page to monitor your weekly momentum.
                  </p>
                  <button className="nav-link-btn" type="button" onClick={() => navigate('/planner#tasks')}>
                    Review Tasks
                  </button>
                </div>
              </aside>
            </section>

            <section className="glass-card progress-upcoming-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div>
                  <h2 style={{ margin: 0 }}>Focus Tasks</h2>
                  <p style={{ color: '#a5b4fc', margin: '0.5rem 0 0' }}>
                    Top pending tasks sorted by deadline.
                  </p>
                </div>
                <span style={{ color: '#94a3b8' }}>{topPending.length} tasks</span>
              </div>

              {topPending.length === 0 ? (
                <p style={{ color: '#cbd5e1' }}>No pending tasks found. Add a new task and watch your progress grow.</p>
              ) : (
                <ul className="progress-task-list">
                  {topPending.map((task) => (
                    <li key={task._id} className="progress-task-card">
                      <div>
                        <h3>{task.title || task.subject || 'Untitled task'}</h3>
                        <p>{task.description ? task.description.slice(0, 100) + (task.description.length > 100 ? '...' : '') : 'No task description provided.'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="priority-pill">{task.difficulty ? `Difficulty ${task.difficulty}/5` : 'No difficulty'}</span>
                        <p style={{ marginTop: '0.75rem', color: '#94a3b8' }}>
                          {task.deadline ? new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No deadline'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default ProgressPage;
