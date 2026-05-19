import React, { useEffect, useState } from 'react';
import { useAppAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';
import '../styles/dashboard.css';

function ProfilePage() {
  const { user } = useAppAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { data } = await getDashboardStats();
        setAnalytics(data?.data || null);
      } catch (err) {
        console.error('Failed to load profile analytics', err);
        setError('Unable to load profile analytics at the moment.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : 'New member';

  const totalMinutes = analytics?.summary?.totalMinutes || 0;
  const sessionCount = analytics?.summary?.totalSessions || 0;
  const avgProductivity = analytics?.summary?.avgProductivity
    ? Math.round(analytics.summary.avgProductivity)
    : '—';
  const streakCount = user?.streak || 0;

  const profileStats = [
    {
      label: 'Study Sessions',
      value: loading ? 'Loading…' : sessionCount || '—',
      hint: 'Tracked from completed study sessions',
    },
    {
      label: 'Study Time',
      value: loading
        ? 'Loading…'
        : totalMinutes
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        : '—',
      hint: 'Total minutes studied across sessions',
    },
    {
      label: 'Productivity',
      value: loading ? 'Loading…' : avgProductivity,
      hint: 'Average session productivity',
    },
    {
      label: 'Current Streak',
      value: streakCount || '—',
      hint: 'Updated after each study session',
    },
  ];

  const profileDetails = [
    { label: 'Study goal', value: user?.goal || 'Not set yet' },
    { label: 'Daily target', value: user?.dailyTarget || 'Not set yet' },
    { label: 'Preferred subjects', value: user?.preferredSubjects || 'Not set yet' },
    { label: 'Tutor style', value: user?.tutorStyle || 'Not set yet' },
    { label: 'Language', value: user?.language || 'Not set yet' },
  ];

  const activityItems = analytics?.weeklyTrend?.length
    ? analytics.weeklyTrend.slice(-3).map((item) => ({
        title: `Studied ${item.minutes} min`,
        subtitle: item._id,
        time: 'Recent',
      }))
    : [
        {
          title: 'No recent activity yet',
          subtitle: 'Your study feed will appear here once you start.',
          time: '',
        },
      ];

  const achievements = [
    { title: 'Consistency King', subtitle: 'Earned by maintaining your streak' },
    { title: 'Quiz Master', subtitle: 'Earned by taking consistent assessments' },
    { title: 'Quick Learner', subtitle: 'Earned by finishing study sessions efficiently' },
  ];

  const streakActiveDays = Math.min(streakCount, 7);

  return (
    <div className="dashboard-main profile-page">
      <div className="dashboard-header profile-header">
        <div>
          <h1>Profile</h1>
          <p>Manage your account and track your learning journey.</p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="profile-grid">
        <div className="glass-card profile-card">
          <div className="profile-card-top">
            <div className="profile-avatar-large">{user?.name?.charAt(0)?.toUpperCase() || 'S'}</div>
            <div>
              <div className="profile-badge-row">
                <h2>{user?.name || 'Study Scholar'}</h2>
              </div>
              <p className="profile-email">{user?.email || 'you@example.com'}</p>
              <p className="profile-joined">Joined {memberSince}</p>
            </div>
          </div>

          <div className="profile-stat-grid">
            {profileStats.map((stat) => (
              <div key={stat.label} className="profile-stat-card">
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
                <span>{stat.hint}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-right-column">
          <div className="glass-card profile-streak-card">
            <div className="section-title-row">
              <h3>Study streak</h3>
              <span>Keep your streak alive</span>
            </div>
            <p className="streak-count">{streakCount} days</p>
            <div className="streak-days">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div key={day} className={`streak-day ${index < streakActiveDays ? 'active' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card activity-card">
            <div className="section-title-row">
              <h3>Recent activity</h3>
              <span>Latest progress updates</span>
            </div>
            <div className="activity-list">
              {activityItems.map((item) => (
                <div key={item.title} className="activity-item">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.subtitle}</p>
                  </div>
                  <span>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card preferences-card">
            <div className="section-title-row">
              <h3>Preferences</h3>
              <span>Personalized study settings</span>
            </div>
            <div className="stats-list">
              {profileDetails.map((detail) => (
                <div key={detail.label} className="stats-row">
                  <strong>{detail.label}</strong>
                  <span>{detail.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card achievement-card">
            <div className="section-title-row">
              <h3>Achievements</h3>
              <span>Milestones unlocked</span>
            </div>
            <div className="achievement-grid">
              {achievements.map((achievement) => (
                <div key={achievement.title} className="achievement-card-item">
                  <strong>{achievement.title}</strong>
                  <span>{achievement.subtitle}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card profile-quote-card">
            <p className="quote-text">
              “The beautiful thing about learning is that no one can take it away from you.”
            </p>
            <p className="quote-author">– B. B. King</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
