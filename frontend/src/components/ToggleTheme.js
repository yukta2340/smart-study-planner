
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ToggleTheme() {
  const { dark, toggleTheme } = useContext(ThemeContext);

  return (
    <button className="theme-btn" onClick={toggleTheme}>
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

export default ToggleTheme;