import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import NativeLogin from "./pages/NativeLogin";
import NativeSignUp from "./pages/NativeSignUp";
import Planner from "./pages/Planner";
import ChatbotPage from "./pages/ChatbotPage";

// Auth Protection
import ProtectedRoute from "./components/ProtectedRoute";

// Styles
import "./styles/home.css";
import "./styles/dashboard.css";
import "./styles/navbar.css";
import "./styles/calendar.css";
import "./styles/chatbot.css";

function AppContent() {
  return (
    <Routes>
      {/* 🌍 Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<NativeLogin />} />
      <Route path="/register" element={<NativeSignUp />} />

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
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;