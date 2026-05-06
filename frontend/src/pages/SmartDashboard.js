import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../services/api';
import '../styles/Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];
const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'progress', label: 'Progress' },
  { id: 'calendar', label: 'Calendar', path: '/planner#calendar' },
  { id: 'chatbot', label: 'AI Coach', path: '/chatbot' },
  { id: 'ai', label: 'AI Suggestions' },
];

function toDateKey(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

function getCurrentWeek() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return DAYS.map((label, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return { label, key: toDateKey(d) };
  });
}

function formatDeadline(deadline) {
  if (!deadline) return 'No due date';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return 'No due date';
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (date.toDateString() === now.toDateString()) {
    return `Today · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
    return `Tomorrow · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const SmartDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks();
        const tasksData = response.data?.data || response.data || [];
        setTasks(tasksData);
      } catch (err) {
        console.error('Failed to load dashboard tasks:', err);
        setError('Unable to load task data right now.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter((task) => !task.completed && new Date(task.deadline).getTime() < Date.now()).length;
  const efficiency = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weeklyData = useMemo(() => {
    const week = getCurrentWeek();
    const map = {};
    week.forEach(({ key, label }) => {
      map[key] = { day: label, Completed: 0, Pending: 0 };
    });

    tasks.forEach((task) => {
      const date = new Date(task.deadline);
      const key = toDateKey(date);
      if (map[key]) {
        if (task.completed) map[key].Completed += 1;
        else map[key].Pending += 1;
      }
    });

    return week.map(({ key }) => map[key]);
  }, [tasks]);

  const hasWeeklyData = weeklyData.some((item) => item.Completed + item.Pending > 0);
  const chartData = hasWeeklyData
    ? weeklyData
    : [{ day: 'All', Completed: completedTasks, Pending: pendingTasks }];

  const upcomingTasks = [...tasks]
    .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
    .slice(0, 5)
    .map((task) => ({
      task: task.title || task.subject || 'Untitled task',
      subject: task.subject || 'General',
      priority:
        task.difficulty >= 4
          ? 'High'
          : task.difficulty >= 2
          ? 'Medium'
          : 'Low',
      due: formatDeadline(task.deadline),
      status: task.completed ? 'Completed' : 'Pending',
    }));

  const subjectChartData = useMemo(() => {
    const grouped = tasks.reduce((acc, task) => {
      const label = task.subject || task.title || 'General';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [tasks]);

  const subjectTotal = subjectChartData.reduce((sum, item) => sum + item.value, 0);

  const handleSidebarNav = (item) => {
    setActiveSection(item.id);
    if (item.path) {
      navigate(item.path);
      return;
    }
    const element = document.getElementById(item.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return <div className="dashboard-container">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">🧠</span>
            <div>
              <h2>StudyAI</h2>
              <p>Smart study dashboard</p>
            </div>
          </div>

          <div className="sidebar-menu">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleSidebarNav(item)}
              >
                <span>{item.label}</span>
                <span className="menu-pill">›</span>
              </button>
            ))}
          </div>

          <div className="sidebar-card">
            <h4>Quick status</h4>
            <p>{completedTasks}/{totalTasks} completed</p>
            <p>{pendingTasks} pending</p>
            <p>{efficiency}% efficiency</p>
          </div>
        </aside>

        <main className="dashboard-main">
          {error && <div className="dashboard-error">{error}</div>}

          <section className="dashboard-header" id="dashboard">
            <div>
              <h1>Welcome back, Scholar 👋</h1>
              <p>Track your task progress, review priorities, and improve your daily study flow.</p>
            </div>
            <div className="sidebar-card" style={{ maxWidth: 320 }}>
              <h4>Today’s summary</h4>
              <p>{completedTasks} completed</p>
              <p>{pendingTasks} pending</p>
              <p>{overdueTasks} overdue</p>
            </div>
          </section>

          <div className="stat-grid">
            <StatCard label="Total Tasks" value={totalTasks} delay={0.1} onClick={() => navigate('/planner')} />
            <StatCard label="Completed" value={completedTasks} delay={0.15} onClick={() => navigate('/planner')} />
            <StatCard label="Pending" value={pendingTasks} delay={0.2} onClick={() => navigate('/planner')} />
            <StatCard label="Efficiency" value={`${efficiency}%`} delay={0.25} onClick={() => navigate('/planner')} />
          </div>

          <div className="chart-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card"
              id="progress"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/planner')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/planner')}
              style={{ cursor: 'pointer' }}
            >
              <div className="section-title-row">
                <h3>Weekly Task Progress</h3>
                <span>{hasWeeklyData ? 'Deadline progress for this week' : 'Overall task progress'}</span>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none' }} />
                    <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Pending" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card"
            >
              <div className="section-title-row">
                <h3>Task Overview</h3>
                <span>Completed vs Pending</span>
              </div>
              <div style={{ width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: completedTasks },
                        { name: 'Pending', value: pendingTasks },
                      ]}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#6366f1" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', color: '#fff', fontWeight: '700' }}>{efficiency}%</div>
                  <div style={{ color: '#94a3b8', marginTop: 4 }}>Task completion rate</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card"
              style={{ gridColumn: '1 / -1' }}
            >
              <div className="section-title-row">
                <h3>Completion Rings</h3>
                <span>Visual status for your completed and pending tasks</span>
              </div>
              <div className="dashboard-rings-row">
                {[
                  {
                    label: 'Completed',
                    value: completedTasks,
                    percent: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
                    color: '#10b981',
                  },
                  {
                    label: 'Pending',
                    value: pendingTasks,
                    percent: totalTasks ? Math.round((pendingTasks / totalTasks) * 100) : 0,
                    color: '#6366f1',
                  },
                ].map((item) => (
                  <div className="ring-card" key={item.label}>
                    <div className="ring-chart">
                      <svg viewBox="0 0 80 80" width="80" height="80">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="10"
                          strokeDasharray={`${Math.round((item.percent / 100) * 201)} 201`}
                          strokeLinecap="round"
                          transform="rotate(-90 40 40)"
                        />
                      </svg>
                      <div className="ring-value">{item.percent}%</div>
                    </div>
                    <div className="ring-details">
                      <div className="ring-count">{item.value}</div>
                      <div className="ring-label">{item.label}</div>
                      <div className="ring-percentage">{item.percent}% share</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card"
            id="tasks"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/planner')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/planner')}
            style={{ cursor: 'pointer' }}
          >
            <div className="section-title-row">
              <h3>Task Section</h3>
              <span>Click to manage your tasks or add new ones</span>
            </div>
            <table className="upcoming-tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTasks.map((task, idx) => (
                  <tr key={idx}>
                    <td>{task.task}</td>
                    <td>{task.subject}</td>
                    <td>
                      <span
                        className={
                          task.priority === 'High'
                            ? 'priority-high'
                            : task.priority === 'Medium'
                            ? 'priority-medium'
                            : 'priority-low'
                        }
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td>{task.due}</td>
                    <td>{task.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="glass-card"
            id="ai"
          >
            <div className="section-title-row">
              <h3>AI Suggestions</h3>
              <span>Smart recommendations for your current task set</span>
            </div>
            <div className="ai-suggestions-grid">
              {[
                {
                  title: 'Finish urgent work first',
                  text: `You have ${pendingTasks} pending tasks. Start with the earliest deadline to improve flow.`,
                },
                {
                  title: 'Raise your completion rate',
                  text:
                    efficiency >= 60
                      ? 'Your completion percentage is strong. Keep this steady pace.'
                      : 'Try to complete one more task today to boost efficiency.',
                },
                {
                  title: 'Avoid overdue buildup',
                  text:
                    overdueTasks > 0
                      ? `There are ${overdueTasks} overdue tasks. Clear one now to reduce pressure.`
                      : 'No overdue tasks — great discipline! Continue this momentum.',
                },
              ].map((suggestion) => (
                <div key={suggestion.title} className="ai-suggestion-card">
                  <h4>{suggestion.title}</h4>
                  <p>{suggestion.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, delay, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card"
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
    role="button"
    tabIndex={0}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div style={{ color: '#94a3b8', marginBottom: '0.65rem', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
  </motion.div>
);

export default SmartDashboard;
