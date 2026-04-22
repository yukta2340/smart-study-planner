import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAppAuth();
  const { toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSectionNavigate = (sectionId) => {
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

        <button type="button" className="theme-toggle" onClick={toggleTheme}>🌗</button>
        
        <div className="user-section">
          <span className="user-name">{user?.name}</span>
          <button type="button" className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;