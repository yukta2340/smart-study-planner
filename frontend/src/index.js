import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Context
import { ThemeProvider } from "./context/ThemeContext";

// Global Styles
import "./styles/global.css";
import "./styles/auth.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
