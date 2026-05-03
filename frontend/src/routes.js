import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/NativeRegister"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const SmartDashboard = lazy(() => import("./pages/SmartDashboard"));
const Planner = lazy(() => import("./pages/Planner"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Protected Route components
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

function AppRoutes() {
  return (
    <Suspense fallback={<div className="loader">Loading...</div>}>
      <Routes>
        {/* 🌍 Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login/*" element={<Login />} />
        <Route path="/register/*" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* 🔐 Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SmartDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <Planner />
            </ProtectedRoute>
          }
        />

        {/* 👑 Role-based */}
        <Route
          path="/admin"
          element={
            <RoleRoute role="admin">
              <div style={{ color: "white" }}>Admin Panel 🔥</div>
            </RoleRoute>
          }
        />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;