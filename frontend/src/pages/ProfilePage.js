import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAppAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : 'New member';

  const profileDetails = [
    { label: 'Study goal', value: user?.goal || 'Build consistency' },
    { label: 'Daily target', value: user?.dailyTarget || '2 - 3 hours' },
    { label: 'Preferred subjects', value: user?.preferredSubjects || 'Math, Science, English' },
    { label: 'Tutor style', value: user?.tutorStyle || 'Friendly' },
    { label: 'Language', value: user?.language || 'English' },
  ];

  const activityItems = [
    { title: 'Completed AI notes', subtitle: 'Biology - Photosynthesis', time: '2h ago' },
    { title: 'Quiz finished', subtitle: 'Physics - Motion in a Straight Line', time: '5h ago' },
    { title: 'Study session', subtitle: 'Chemistry - Thermodynamics', time: '1d ago' },
  ];

  return (
    <div className="dashboard-main profile-page">
      <div className="dashboard-header profile-header">
        <div>
          <h1>Profile</h1>
          <p>Manage your account and track your learning journey.</p>
        </div>
        <button className="profile-edit-button" type="button" onClick={() => navigate('/profile')}>
          Edit Profile
        </button>
      </div>

      <div className="profile-grid">
        <div className="glass-card profile-card">
          <div className="profile-card-top">
            <div className="profile-avatar-large">{user?.name?.charAt(0)?.toUpperCase() || 'S'}</div>
            <div>
              <div className="profile-badge-row">
                <h2>{user?.name || 'Study Scholar'}</h2>
              </div>
              <p className="profile-email">{user?.email || 'you@example.com'}</p>
              <p className="profile-tagline">{user?.tagline || 'Learning today, leading tomorrow.'}</p>
              <p className="profile-joined">Joined {memberSince}</p>
            </div>
          </div>

          <div className="profile-stat-grid">
            <div className="profile-stat-card">
              <p>Study Sessions</p>
              <strong>{user?.sessions || 128}</strong>
              <span>+18 this month</span>
            </div>
            <div className="profile-stat-card">
              <p>Study Time</p>
              <strong>{user?.studyTime || '84h 32m'}</strong>
              <span>+12h this month</span>
            </div>
            <div className="profile-stat-card">
              <p>Quizzes Taken</p>
              <strong>{user?.quizzes || 56}</strong>
              <span>+9 this month</span>
            </div>
            <div className="profile-stat-card">
              <p>Current Streak</p>
              <strong>{user?.streak || 23} days</strong>
              <span>Keep it up!</span>
            </div>
          </div>

          {/* Subscription / upgrade UI removed */}
        </div>

        <div className="profile-right-column">
          <div className="glass-card profile-streak-card">
            <div className="section-title-row">
              <h3>Study streak</h3>
              <span>Best streak: 37 days</span>
            </div>
            <p className="streak-count">{user?.streak || 23} days</p>
            <div className="streak-days">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div key={day} className={`streak-day ${index < 5 ? 'active' : ''}`}>
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
              {[
                { title: 'Consistency King', subtitle: 'Study for 20 days' },
                { title: 'Quiz Master', subtitle: 'Take 50 quizzes' },
                { title: 'Quick Learner', subtitle: 'Complete 10 notes' },
              ].map((achievement) => (
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
