import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, Trophy, Target, Brain, Zap, Clock, ChevronRight
} from 'lucide-react';
import { getDashboardStats, getWeeklyRoadmap } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];

const SmartDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, roadmapRes] = await Promise.all([
          getDashboardStats(),
          getWeeklyRoadmap()
        ]);
        
        // Defensive checks for data structure
        const dashboardData = statsRes?.data?.data || null;
        const roadmapData = roadmapRes?.data?.data?.roadmap || [];
        
        setStats(dashboardData);
        setRoadmap(roadmapData);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        // Fallback dummy data
        setStats({
          summary: { totalMinutes: 120, totalSessions: 5, avgProductivity: 7.5 },
          subjects: [{ _id: 'Study', timeSpent: 120 }],
          weeklyTrend: [{ _id: 'Today', minutes: 120 }]
        });
        setRoadmap([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="dashboard-container">Loading Intelligence...</div>;
  if (!stats) return <div className="dashboard-container">Error loading dashboard stats.</div>;


  // --- Dynamic Data Mapping ---
  // 1. Stat Cards
  const totalTasks = stats?.tasks?.total ?? 0;
  const completedTasks = stats?.tasks?.completed ?? 0;
  const pendingTasks = stats?.tasks?.pending ?? (totalTasks - completedTasks);
  const efficiency = stats?.efficiency ?? (totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0);
  const taskCompletionPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Donut Chart Data
  const donutData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks },
  ];

  // 3. Weekly Task Progress (Line Chart)
  // Expecting stats.weeklyTrend: [{ _id: 'Mon', completed: 2, pending: 1 }, ...]
  const weeklyTrend = (stats?.weeklyTrend || []).map(day => ({
    day: day._id,
    Completed: day.completed ?? 0,
    Pending: day.pending ?? 0,
  }));

  // 4. Upcoming Tasks Table (from stats.tasksList or roadmap)
  // Prefer stats.tasksList if available, else fallback to roadmap
  let upcomingTasks = [];
  if (Array.isArray(stats?.tasksList)) {
    upcomingTasks = stats.tasksList
      .filter(t => !t.completed)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5)
      .map(t => ({
        task: t.title || t.task || t.subject,
        subject: t.subject || '',
        priority: t.priority || 'Medium',
        due: t.deadline ?
          (() => {
            const d = new Date(t.deadline);
            const now = new Date();
            if (d.toDateString() === now.toDateString()) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            if (d - now < 24*60*60*1000 && d > now) return `Tomorrow, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          })() : 'No due date',
        status: t.status || (t.completed ? 'Completed' : 'Pending'),
      }));
  } else if (Array.isArray(roadmap) && roadmap.length > 0) {
    // fallback: show roadmap sessions as tasks
    upcomingTasks = roadmap.flatMap(day => (day.sessions || []).map(s => ({
      task: s.title || s.task || s.subject,
      subject: s.subject || '',
      priority: s.priority || 'Medium',
      due: day.date || '',
      status: 'Pending',
    }))).slice(0, 5);
  }

  const subjectChartData = (Array.isArray(stats?.subjects) && stats.subjects.length > 0)
    ? stats.subjects.map((sub, index) => ({
        name: sub.name || sub._id || 'Subject',
        value: sub.timeSpent || sub.minutes || sub.value || 0,
        color: sub.color || COLORS[index % COLORS.length],
      }))
    : [
        { name: 'Math', value: 40, color: COLORS[0] },
        { name: 'Science', value: 30, color: COLORS[1] },
        { name: 'History', value: 20, color: COLORS[2] },
        { name: 'Languages', value: 10, color: COLORS[3] },
      ];

  const subjectTotal = subjectChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="planner-page">
      <Navbar />
      <div className="dashboard-container">
        {/* Navigation Buttons */}
        <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem'
        }}
      >
        <button className="nav-link-btn" type="button" onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
        <button className="nav-link-btn" type="button" onClick={() => navigate('/planner#tasks')}>
          Tasks
        </button>
        <button className="nav-link-btn" type="button" onClick={() => navigate('/planner#progress')}>
          Progress
        </button>
        <button className="nav-link-btn" type="button" onClick={() => navigate('/planner#calendar')}>
          Calendar
        </button>
        <button className="nav-link-btn" type="button" onClick={() => navigate('/chatbot')}>
          AI Coach
        </button>
      </motion.div>

        {/* Greeting Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            Welcome back, <span className="text-gradient">Scholar</span> <span role="img" aria-label="wave">👋</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '0.5rem' }}>Let's stay productive today.</p>
        </motion.header>


        {/* Stat Cards */}
        <div className="stat-grid">
          <StatCard 
            icon={<i className="fa fa-tasks" style={{ color: '#6366f1', fontSize: 24 }}></i>} 
            label="Total Tasks" 
            value={totalTasks}
            delay={0.1}
          />
          <StatCard 
            icon={<i className="fa fa-check-circle" style={{ color: '#10b981', fontSize: 24 }}></i>} 
            label="Completed" 
            value={completedTasks}
            delay={0.2}
          />
          <StatCard 
            icon={<i className="fa fa-clock" style={{ color: '#f59e0b', fontSize: 24 }}></i>} 
            label="Pending" 
            value={pendingTasks}
            delay={0.3}
          />
          <StatCard 
            icon={<i className="fa fa-bolt" style={{ color: '#a855f7', fontSize: 24 }}></i>} 
            label="Efficiency" 
            value={efficiency + '%'}
            delay={0.4}
          />
        </div>


        {/* Charts Section */}
        <div className="chart-grid">
          {/* Weekly Task Progress (Line Chart) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa fa-line-chart" style={{ color: '#6366f1' }}></i> Weekly Task Progress
              </h3>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={[
                  { day: 'Mon', Completed: 2, Pending: 1 },
                  { day: 'Tue', Completed: 1, Pending: 2 },
                  { day: 'Wed', Completed: 3, Pending: 1 },
                  { day: 'Thu', Completed: 2, Pending: 1 },
                  { day: 'Fri', Completed: 1, Pending: 1 },
                  { day: 'Sat', Completed: 2, Pending: 1 },
                  { day: 'Sun', Completed: 2, Pending: 1 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Pending" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Task Overview (Donut Chart) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-card"
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa fa-pie-chart" style={{ color: '#a855f7' }}></i> Task Overview
            </h3>
            <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{taskCompletionPct}%</span>
                <div style={{ color: '#94a3b8', fontSize: '1rem' }}>Completed</div>
                <div style={{ color: '#22c55e', fontWeight: 'bold', marginTop: '0.5rem' }}>Great progress!<br />Keep it up, Scholar! 🚀</div>
              </div>
            </div>
          </motion.div>

          {/* Subject Breakdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="glass-card"
            style={{ gridColumn: '1 / -1' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa fa-pie-chart" style={{ color: '#38bdf8' }}></i> Subject Performance
              </h3>
              <a href="#" style={{ color: '#94a3b8', fontSize: '0.95rem', textDecoration: 'none', cursor: 'pointer' }}>View Detailed Report</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', justifyItems: 'center' }}>
              {subjectChartData.map((sub, index) => {
                const percent = Math.round((sub.value / (subjectTotal || 1)) * 100);
                return (
                  <div key={sub.name} style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 1rem' }}>
                      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="50" 
                          fill="none" 
                          stroke={sub.color} 
                          strokeWidth="8"
                          strokeDasharray={`${(percent / 100) * 314} 314`}
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>{percent}%</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>{sub.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>↑ 5%</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>


        {/* Upcoming Tasks Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card"
          style={{ marginTop: '2rem' }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa fa-list-alt" style={{ color: '#6366f1' }}></i> Upcoming Tasks
          </h3>
          <table className="upcoming-tasks-table">
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
              {upcomingTasks.map((t, idx) => (
                <tr key={idx}>
                  <td>{t.task}</td>
                  <td>{t.subject}</td>
                  <td>
                    <span className={
                      t.priority === 'High' ? 'priority-high' :
                      t.priority === 'Medium' ? 'priority-medium' : 'priority-low'
                    }>{t.priority}</span>
                  </td>
                  <td>{t.due}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Motivational Footer */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#a5b4fc', fontWeight: 500, fontSize: '1.1rem' }}>
          <span role="img" aria-label="star">⭐</span> Progress is progress, no matter how small. <span style={{ color: '#38bdf8', fontWeight: 600 }}>Keep pushing forward!</span>
        </div>
      </div>
    </div>
  );
};


// StatCard for dashboard
const StatCard = ({ icon, label, value, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="glass-card"
    style={{ minWidth: 0 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)' }}>{icon}</div>
      <div>
        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      </div>
    </div>
  </motion.div>
);

export default SmartDashboard;
