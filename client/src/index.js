
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
  root.render(
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 640,
        margin: "10vh auto",
        padding: "2rem",
        border: "1px solid #f0b4b4",
        borderRadius: 12,
        background: "#fff5f5",
        color: "#5a1d1d",
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ marginTop: 0 }}>Configuration required</h1>
      <p>
        This site is missing the <code>VITE_CLERK_PUBLISHABLE_KEY</code>{" "}
        environment variable, so authentication can't start.
      </p>
      <p>
        Site owner: add <code>VITE_CLERK_PUBLISHABLE_KEY</code> in your Netlify
        site's environment variables (Site settings → Environment variables)
        using the publishable key from your Clerk dashboard, then redeploy.
        Because Vite inlines <code>VITE_*</code> variables at build time, a new
        deploy is required after adding the key.
      </p>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={clerkPubKey}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ClerkProvider>
    </React.StrictMode>
  );
}
