
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

// Styles
import "./styles/home.css";
import "./styles/dashboard.css";
import "./styles/navbar.css";
import "./styles/calendar.css";
import "./styles/chatbot.css";

function AppContent() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      // Register this browser as an FCM notification target
      registerDeviceToken().catch(() => {});
    }
  }, [isSignedIn]);

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