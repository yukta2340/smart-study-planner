import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";

// Context
import { ThemeProvider } from "./context/ThemeContext";

// Global Styles
import "./styles/global.css";
import "./styles/auth.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>
);
