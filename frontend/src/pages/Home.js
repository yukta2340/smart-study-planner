
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppAuth();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Show loading or nothing while redirecting
  if (isAuthenticated) {
    return <div className="loader">Redirecting to dashboard...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-glow home-glow-one" />
      <div className="home-glow home-glow-two" />
      <div className="home-grid-overlay" />

      {/* Hero Section */}
      <div className="hero">
        <span className="hero-badge">AI Powered Productivity</span>

        <h1 className="title">
          <span className="title-icon">🧠</span>
          <span>AI Smart Study Planner</span>
        </h1>

        <p className="subtitle">
          Plan with precision. Learn with momentum. Finish with confidence.
        </p>

        <p className="hero-subline">
          Build a focused routine with adaptive daily goals, deadline intelligence,
          and AI coaching that keeps your study streak alive.
        </p>

        <div className="buttons">
          <button onClick={() => navigate("/login")}>
            Start Planning
          </button>

          <button
            className="secondary"
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>

          <button
            className="tertiary"
            onClick={() => navigate("/native-login")}
          >
            Test Login
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">24/7</span>
            <span className="hero-stat-label">AI assistance</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">Weekly</span>
            <span className="hero-stat-label">Progress graph</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">Smart</span>
            <span className="hero-stat-label">Deadline alerts</span>
          </div>
        </div>

      </div>

      {/* Features Section */}
      <div className="features">

        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Smart Scheduling</h3>
          <p>Auto-build practical study plans that adapt around real deadlines.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Progress Tracking</h3>
          <p>Follow weekly wins with clean visual analytics and trends.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Goal Optimization</h3>
          <p>Prioritize high-impact tasks when your schedule gets tight.</p>
        </div>

      </div>

    </div>
  );
}

export default Home;