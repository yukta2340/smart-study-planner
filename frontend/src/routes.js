import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const SmartDashboard = lazy(() => import("./pages/SmartDashboard"));

function AppRoutes() {
  return (
    <Suspense fallback={<div className="loader">Loading...</div>}>

      <Routes>

        {/* 🌍 Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login/*" element={<Login />} />
        <Route path="/register/*" element={<Register />} />

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

        {/* 👑 Role-based (example admin route) */}
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