import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, Trophy, Target, Brain, Zap, Clock, ChevronRight
} from 'lucide-react';
import { getDashboardStats, getWeeklyRoadmap } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

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

  return (
    <div className="planner-page">
      <Navbar />
      <div className="dashboard-container">
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
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
          Welcome back, <span className="text-gradient">Scholar</span>
        </h1>
        <p style={{ color: '#94a3b8' }}>Your AI has optimized 7 days of study based on your performance.</p>
      </motion.header>

      <div className="stat-grid">
        <StatCard 
          icon={<Flame color="#f97316" />} 
          label="Current Streak" 
          value="12 Days" 
          subText="Top 5% of Students"
          delay={0.1}
        />
        <StatCard 
          icon={<Trophy color="#eab308" />} 
          label="Knowledge Level" 
          value="Lvl 14" 
          progress={75}
          delay={0.2}
        />
        <StatCard 
          icon={<Target color="#ec4899" />} 
          label="Today's Goal" 
          value="360 min" 
          subText="4 Sessions Scheduled"
          delay={0.3}
        />
      </div>

      <div className="chart-grid">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="#6366f1" /> Weekly Productivity
            </h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={stats.weeklyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={20} color="#a855f7" /> Focus Areas
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.subjects || []}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="timeSpent"
                  nameKey="_id"
                >
                  {(stats.subjects || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card"
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="#ec4899" /> AI Smart Roadmap
        </h3>
        <div className="roadmap-list">
          {(roadmap || []).slice(0, 3).map((day, idx) => (
            <div key={idx} className="roadmap-item">
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#6366f1' }}>{day.date}</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 'medium' }}>{day.status}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{day.sessions?.length || 0} Sessions</div>
                <div className="progress-bar" style={{ width: '100px' }}>
                  <div className="progress-fill" style={{ width: `${((360 - day.remainingMins) / 360) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subText, progress, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="glass-card"
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)' }}>{icon}</div>
      <div>
        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      </div>
    </div>
    {progress && (
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    )}
    {subText && <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>{subText}</div>}
  </motion.div>
);

export default SmartDashboard;
