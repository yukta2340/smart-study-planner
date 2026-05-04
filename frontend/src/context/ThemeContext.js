
import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") setDark(false);
    else if (savedTheme === "dark") setDark(true);
  }, []);

  // Save theme and keep theme classes in sync across body + root.
  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("light", !dark);

    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.classList.toggle("dark", dark);
      rootElement.classList.toggle("light", !dark);
    }
  }, [dark]);

  const toggleTheme = () => setDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      <div className={dark ? "dark" : "light"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}