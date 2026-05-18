import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getTasks } from '../services/api';
import '../styles/dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function StudyInsightsPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks();
        setTasks(response?.data?.data || []);
      } catch (err) {
        setError('Could not load your study tasks. Please try again shortly.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const overdueTasks = tasks.filter(
    (task) => !task.completed && task.deadline && new Date(task.deadline) < new Date()
  ).length;
  const dueSoonTasks = tasks.filter((task) => {
    if (task.completed || !task.deadline) return false;
    const deadline = new Date(task.deadline);
    const now = new Date();
    const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return deadline >= now && deadline <= soon;
  }).length;

  const subjectSummary = useMemo(() => {
    const summary = tasks.reduce((acc, task) => {
      const subject = task.subject || 'General';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(summary)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [tasks]);

  const focusAreas = useMemo(() => {
    const insights = [];
    if (overdueTasks > 0) {
      insights.push(`${overdueTasks} overdue task${overdueTasks === 1 ? '' : 's'} require immediate attention.`);
    }
    if (dueSoonTasks > 0) {
      insights.push(`${dueSoonTasks} task${dueSoonTasks === 1 ? '' : 's'} are due within 3 days. Plan your next sessions accordingly.`);
    }
    if (subjectSummary.length > 0) {
      insights.push(`Most active subjects: ${subjectSummary.slice(0, 3).map((item) => item.subject).join(', ')}.`);
    }
    if (!insights.length) {
      insights.push('Your study plan is on track. Continue building consistent momentum.');
    }
    return insights;
  }, [overdueTasks, dueSoonTasks, subjectSummary]);

  const insightData = useMemo(() => {
    return [
      { name: 'Completed', value: completedTasks },
      { name: 'Overdue', value: overdueTasks },
      { name: 'Due Soon', value: dueSoonTasks },
    ];
  }, [completedTasks, overdueTasks, dueSoonTasks]);

  return (
    <div className="dashboard-main performance-page">
      <div className="dashboard-header">
        <div>
          <h1>Study Insights</h1>
          <p>
            Discover the strengths and gaps in your study habits, subject focus, and
            deadline management.
          </p>
        </div>
      </div>

      <div className="section-title-row">
        <h3>Insight overview</h3>
        <span>{loading ? 'Loading insights…' : `${totalTasks} tasks analyzed`}</span>
      </div>

      {error ? (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="stat-grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-card">
              <p>Total tasks</p>
              <strong>{totalTasks}</strong>
            </div>
            <div className="glass-card">
              <p>Completed</p>
              <strong>{completedTasks}</strong>
            </div>
            <div className="glass-card">
              <p>Due soon</p>
              <strong>{dueSoonTasks}</strong>
            </div>
            <div className="glass-card">
              <p>Overdue</p>
              <strong>{overdueTasks}</strong>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="section-title-row">
              <h3>Subject concentration</h3>
              <span>Where most of your effort is going</span>
            </div>
            <ul className="performance-list" style={{ marginTop: '1rem' }}>
              {subjectSummary.map((item) => (
                <li key={item.subject}>
                  <strong>{item.subject}</strong>: {item.count} task{item.count === 1 ? '' : 's'}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="section-title-row">
              <h3>Deadline pulse</h3>
              <span>Track task status at a glance</span>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={insightData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {insightData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card performance-insights" style={{ padding: '1.5rem' }}>
            <div className="section-title-row">
              <h3>Actionable study insights</h3>
              <span>Focus on the most meaningful improvements</span>
            </div>
            <ul className="performance-list">
              {focusAreas.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default StudyInsightsPage;
