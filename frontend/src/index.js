
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";

// Context
import { ThemeProvider } from "./context/ThemeContext";

// Global Styles
import "./styles/global.css";
import "./styles/auth.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const root = ReactDOM.createRoot(document.getElementById("root"));

if (!clerkPubKey) {
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to your environment variables.");
}

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey || ""}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>
);
