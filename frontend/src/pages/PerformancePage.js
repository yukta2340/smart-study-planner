import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { getTasks } from '../services/api';
import '../styles/dashboard.css';

function PerformancePage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks();
        setTasks(response?.data?.data || []);
      } catch (err) {
        setError('Unable to load your study tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks]
  );

  const pendingTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((task) => {
      return (
        !task.completed &&
        task.deadline &&
        new Date(task.deadline) < now
      );
    });
  }, [tasks]);

  const dueSoonTasks = useMemo(() => {
    const now = new Date();
    const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return tasks.filter((task) => {
      const deadline = task.deadline ? new Date(task.deadline) : null;
      return (
        !task.completed &&
        deadline &&
        deadline >= now &&
        deadline <= soon
      );
    });
  }, [tasks]);

  const graphData = useMemo(() => {
    return [
      { name: 'Completed', value: completedTasks.length, color: '#10b981' },
      { name: 'Pending', value: pendingTasks.length, color: '#f59e0b' },
      { name: 'Overdue', value: overdueTasks.length, color: '#ef4444' },
    ];
  }, [completedTasks.length, pendingTasks.length, overdueTasks.length]);

  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const laggingPointers = useMemo(() => {
    const pointers = [];

    if (overdueTasks.length > 0) {
      pointers.push(
        `You have ${overdueTasks.length} overdue task${
          overdueTasks.length === 1 ? '' : 's'
        }. Finish these first to reduce study delay.`
      );
    }

    if (dueSoonTasks.length > 0) {
      pointers.push(
        `${dueSoonTasks.length} task${dueSoonTasks.length === 1 ? '' : 's'} are due within the next 3 days. Reserve time for them.`
      );
    }

    const hardPendingTasks = tasks.filter(
      (task) => !task.completed && task.difficulty >= 4
    );

    if (hardPendingTasks.length > 0) {
      pointers.push(
        `You have ${hardPendingTasks.length} high-difficulty pending task${
          hardPendingTasks.length === 1 ? '' : 's'
        }. Prioritize the hardest ones while focus is strong.`
      );
    }

    if (pointers.length === 0) {
      pointers.push('Your study pace is balanced. Keep up the momentum!');
    }

    return pointers;
  }, [tasks, overdueTasks.length, dueSoonTasks.length]);

  return (
    <div className="dashboard-main performance-page">
      <div className="dashboard-header">
        <div>
          <h1>Performance Analytics</h1>
          <p>
            Track your progress with task-level insights, completion metrics, and
            the biggest areas where you may be falling behind.
          </p>
        </div>
      </div>

      <div className="section-title-row">
        <h3>Current performance</h3>
        <span>{loading ? 'Loading data…' : `${tasks.length} tasks evaluated`}</span>
      </div>

      {error ? (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="stat-grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-card">
              <p>Completion rate</p>
              <strong>{completionRate}%</strong>
            </div>
            <div className="glass-card">
              <p>Completed tasks</p>
              <strong>{completedTasks.length}</strong>
            </div>
            <div className="glass-card">
              <p>Pending tasks</p>
              <strong>{pendingTasks.length}</strong>
            </div>
            <div className="glass-card">
              <p>Overdue tasks</p>
              <strong>{overdueTasks.length}</strong>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div className="section-title-row">
              <h3>Performance graph</h3>
              <span>{completionRate}% completion rate</span>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={graphData} margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Tasks" fill="#2563eb">
                    {graphData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card performance-insights" style={{ padding: '1.5rem' }}>
            <div className="section-title-row">
              <h3>Lagging pointers</h3>
              <span>Focus on the areas that need your attention</span>
            </div>
            <ul className="performance-list">
              {laggingPointers.map((pointer, index) => (
                <li key={index}>{pointer}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default PerformancePage;
