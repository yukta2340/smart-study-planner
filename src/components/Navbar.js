
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { ThemeContext } from "../context/ThemeContext";

function Navbar() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { toggleTheme } = useContext(ThemeContext);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSectionNavigate = (sectionId) => {
    navigate(`/planner#${sectionId}`);
  };

  return (
    <nav className="navbar">
      <h2 className="logo">🧠 StudyAI</h2>

      <div className="nav-links">
        <button
          type="button"
          className="nav-link-btn"
          onClick={() => handleSectionNavigate("dashboard")}
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

        <button type="button" onClick={toggleTheme}>🌗</button>
        <button type="button" className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;