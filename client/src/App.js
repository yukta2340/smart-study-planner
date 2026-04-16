
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Planner from "./pages/Planner";
import ChatbotPage from "./pages/ChatbotPage";

// Auth Protection
import ProtectedRoute from "./components/ProtectedRoute";

// FCM auto-registration
import { registerDeviceToken } from "./utils/fcmClient";

// API
import { setCurrentClerkUserId } from "./services/api";

// Styles
import "./styles/home.css";
import "./styles/dashboard.css";
import "./styles/navbar.css";
import "./styles/calendar.css";
import "./styles/chatbot.css";

function AppContent() {
  const { isSignedIn, userId, isLoaded } = useAuth();

  useEffect(() => {
    console.log("🔐 Auth State:", { isLoaded, isSignedIn, userId });
    
    if (isLoaded && isSignedIn && userId) {
      // Set Clerk user ID for API requests
      setCurrentClerkUserId(userId);
      
      // Register this browser as an FCM notification target
      registerDeviceToken().catch((err) => {
        console.error("❌ FCM registration failed:", err);
      });
    } else if (isLoaded && !isSignedIn) {
      // Clear user ID when logged out
      console.log("🚪 User logged out, clearing user ID");
      setCurrentClerkUserId(null);
    }
  }, [isLoaded, isSignedIn, userId]);

  return (
    <Routes>

      {/* 🌍 Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login/*" element={<Login />} />
      <Route path="/register/*" element={<Register />} />

      {/* 🔐 Protected Routes */}
      <Route
        path="/planner"
        element={
          <ProtectedRoute>
            <Planner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <ChatbotPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </Router>
  );
}

export default App;