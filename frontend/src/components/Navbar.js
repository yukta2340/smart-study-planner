import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAppAuth();
  const { dark, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSectionNavigate = (sectionId) => {
    if (sectionId === "progress") {
      navigate("/progress");
      return;
    }
    navigate(`/planner#${sectionId}`);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
        <h2 className="logo">🧠 StudyAI</h2>
      </div>

      <div className="nav-links">
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => handleSectionNavigate("tasks")}
        >
          Tasks
        </button>
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => handleSectionNavigate("progress")}
        >
          Progress
        </button>
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => handleSectionNavigate("calendar")}
        >
          Calendar
        </button>
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => navigate("/chatbot")}
        >
          AI Coach
        </button>

        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {dark ? "🌙 Dark" : "☀️ Light"}
        </button>

        <div className="user-section">
          {user?._id && (
            <div className="user-id-badge">
              <span className="user-icon">
                {user?.gender === 'female' ? '👩' : user?.gender === 'male' ? '👨' : '👤'}
              </span>
              <span className="user-id-text">ID: {user._id.slice(-8)}</span>
            </div>
          )}
          <span className="user-name">
            {user?.fullName || user?.firstName || user?.name || user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress}
          </span>
          <button type="button" className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;