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
import { useAppAuth } from '../context/AuthContext';
import { getTasks } from '../services/api';
import '../styles/Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];
const SIDEBAR_SECTIONS = [
  {
    title: 'Study',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'tasks', label: 'Tasks' },
      { id: 'progress', label: 'Progress' },
      { id: 'calendar', label: 'Calendar', path: '/planner#calendar' },
      { id: 'chatbot', label: 'AI Coach', path: '/chatbot' },
      { id: 'ai', label: 'AI Suggestions', badge: 'New' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { id: 'performance', label: 'Performance' },
      { id: 'studyInsights', label: 'Study Insights' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { id: 'notes', label: 'Notes' },
      { id: 'flashcards', label: 'Flashcards' },
      { id: 'resources', label: 'Resources' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'settings', label: 'Settings' },
      { id: 'profile', label: 'Profile' },
    ],
  },
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
  const { user } = useAppAuth();
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

  const totalStudyMinutes = tasks.reduce((sum, task) => sum + (task.estimatedTime || 60), 0);
  const totalStudyHours = Math.floor(totalStudyMinutes / 60);
  const avgDailyMinutes = Math.round(totalStudyMinutes / 7);
  const avgDailyHours = Math.floor(avgDailyMinutes / 60);

  const totalStudyTimeLabel = `${totalStudyHours}h ${totalStudyMinutes % 60}m`;
  const avgDailyTimeLabel = `${avgDailyHours}h ${avgDailyMinutes % 60}m`;
  const currentStreak = 12;
  const knowledgeLevel = user?.level || 14;
  const todayGoal = 360;

  const recentActivity = tasks.slice(0, 3).map((task, index) => ({
    title: task.completed
      ? `Completed ${task.title || task.subject || 'a task'}`
      : `Started ${task.title || task.subject || 'a task'}`,
    subtitle: task.subject || 'General',
    time: index === 0 ? 'Today, 8:45 PM' : index === 1 ? 'Today, 6:30 PM' : 'Today, 4:15 PM',
    duration: task.estimatedTime ? `${task.estimatedTime} mins` : '1h 20m',
    status: task.completed ? 'Completed' : 'In progress',
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

  const subjectPerformance = subjectChartData.slice(0, 4).map((item) => ({
    ...item,
    percent: subjectTotal ? Math.round((item.value / subjectTotal) * 100) : 0,
  }));

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
              <p>Personal study command center</p>
            </div>
          </div>

          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title} className="sidebar-section">
              <div className="sidebar-section-title">{section.title}</div>
              <div className="sidebar-section-items">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`sidebar-menu-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => handleSidebarNav(item)}
                  >
                    <span>{item.label}</span>
                    <span className="menu-pill">
                      {item.badge ? <span className="sidebar-item-badge">{item.badge}</span> : '›'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="sidebar-card sidebar-upgrade-card">
            <div className="sidebar-card-header">
              <span className="upgrade-label">Upgrade to Pro</span>
              <span className="upgrade-pill">New</span>
            </div>
            <p>Unlock advanced AI insights and personalized study plans.</p>
            <button type="button" className="upgrade-button" onClick={() => navigate('/planner')}>
              Upgrade Now
            </button>
          </div>

          <div className="sidebar-profile-card">
            <div className="sidebar-profile-avatar">{user?.name?.charAt(0) || 'S'}</div>
            <div>
              <div className="sidebar-profile-name">{user?.name || user?.email || 'Study Enthusiast'}</div>
              <div className="sidebar-profile-meta">Level {user?.level || 14}</div>
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          {error && <div className="dashboard-error">{error}</div>}

          <section className="dashboard-topbar">
            <div>
              <h1>Welcome back, Scholar 👋</h1>
              <p>Your AI has optimized 7 days of study based on your performance.</p>
            </div>
            <div className="dashboard-top-right">
              <div className="search-box">
                <span>🔎</span>
                <input type="text" placeholder="Search anything..." />
              </div>
              <div className="profile-summary">
                <div className="profile-avatar-small">{user?.name?.charAt(0) || 'S'}</div>
                <div>
                  <div className="profile-name">{user?.name || user?.email || 'Scholar'}</div>
                  <div className="profile-level">Level {knowledgeLevel}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-metrics-grid">
            <div className="metric-card metric-card-primary">
              <div className="metric-card-icon">🔥</div>
              <div>
                <p>Current Streak</p>
                <h3>{currentStreak} Days</h3>
                <span>Keep it up!</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-card-icon">🏆</div>
              <div>
                <p>Knowledge Level</p>
                <h3>Lvl {knowledgeLevel}</h3>
                <span>2,350 / 3,000 XP</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-card-icon">🎯</div>
              <div>
                <p>Today's Goal</p>
                <h3>{todayGoal} min</h3>
                <span>4 Sessions Scheduled</span>
              </div>
            </div>
            <div className="metric-card metric-card-success">
              <div className="metric-card-icon">🚀</div>
              <div>
                <p>Efficiency</p>
                <h3>{efficiency}%</h3>
                <span>Your productivity score</span>
              </div>
            </div>
          </section>

          <section className="dashboard-body-grid">
            <div className="dashboard-left">
              <div className="glass-card weekly-productivity-card">
                <div className="section-title-row">
                  <h3>Weekly Productivity</h3>
                  <span>This Week</span>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none' }} />
                      <Line type="monotone" dataKey="Completed" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Pending" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="subject-performance-grid">
                {subjectPerformance.map((subject) => (
                  <div key={subject.name} className="glass-card subject-performance-card">
                    <div className="subject-performance-ring" style={{ background: `conic-gradient(${subject.color} ${subject.percent * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}>
                      <span>{subject.percent}%</span>
                    </div>
                    <div>
                      <p>{subject.name}</p>
                      <strong>{subject.percent}%</strong>
                      <span>{subject.value} tasks</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="recent-grid">
                <div className="glass-card recent-activity-card">
                  <div className="section-title-row">
                    <h3>Recent Activity</h3>
                    <span>Latest study moves</span>
                  </div>
                  <div className="activity-list">
                    {recentActivity.map((item) => (
                      <div key={item.title} className="activity-item">
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.subtitle}</p>
                        </div>
                        <div>
                          <span>{item.time}</span>
                          <strong>{item.duration}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card study-insights-card">
                  <div className="section-title-row">
                    <h3>Study Insights</h3>
                    <span>Smart learning tips</span>
                  </div>
                  <div className="insights-list">
                    <div className="insight-item">
                      <strong>Most Productive Day</strong>
                      <span>Friday</span>
                    </div>
                    <div className="insight-item">
                      <strong>Most Productive Time</strong>
                      <span>7 PM - 10 PM</span>
                    </div>
                    <div className="insight-item">
                      <strong>Preferred Study Mode</strong>
                      <span>Deep Focus</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card quick-stats-card">
                  <div className="section-title-row">
                    <h3>Quick Stats</h3>
                    <span>Snapshot metrics</span>
                  </div>
                  <div className="stats-list">
                    <div className="stats-row">
                      <span>Total Study Time</span>
                      <strong>{totalStudyTimeLabel}</strong>
                    </div>
                    <div className="stats-row">
                      <span>Tasks Completed</span>
                      <strong>{completedTasks} / {totalTasks}</strong>
                    </div>
                    <div className="stats-row">
                      <span>Tests Taken</span>
                      <strong>12</strong>
                    </div>
                    <div className="stats-row">
                      <span>Accuracy</span>
                      <strong>{efficiency}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="dashboard-right">
              <div className="glass-card ai-suggestions-panel">
                <div className="section-title-row">
                  <h3>AI Suggestions</h3>
                  <button type="button" className="view-all-btn">View All</button>
                </div>
                <div className="ai-suggestions-grid">
                  {[
                    {
                      title: 'Focus on Data Structures',
                      text: "You're spending less time on Data Structures. Increase focus for better results.",
                      action: 'Focus Now',
                    },
                    {
                      title: 'Optimize Study Time',
                      text: 'You study best between 7PM - 10PM. Plan more sessions in this slot.',
                      action: 'Adjust Plan',
                    },
                    {
                      title: 'Revise Operating Systems',
                      text: 'Your retention rate is low in OS topics. Quick revision recommended.',
                      action: 'Start Revision',
                    },
                    {
                      title: 'Take a Mock Test',
                      text: 'You’re exam-ready! Take a mock test to evaluate your preparation.',
                      action: 'Start Test',
                    },
                  ].map((suggestion) => (
                    <div key={suggestion.title} className="ai-suggestion-card">
                      <h4>{suggestion.title}</h4>
                      <p>{suggestion.text}</p>
                      <button type="button" className="suggestion-action-btn">{suggestion.action}</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card upcoming-schedule-panel">
                <div className="section-title-row">
                  <h3>Upcoming Schedule</h3>
                  <button type="button" className="view-all-btn">View Calendar</button>
                </div>
                <div className="schedule-list">
                  {upcomingTasks.map((task, idx) => (
                    <div key={idx} className="schedule-item">
                      <div className="schedule-meta">
                        <strong>{task.task}</strong>
                        <span>{task.subject}</span>
                      </div>
                      <div className="schedule-time">
                        <span>{task.due}</span>
                        <span className="schedule-badge">{task.status === 'Completed' ? 'Done' : task.due.startsWith('Today') ? 'Today' : 'Tomorrow'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
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
