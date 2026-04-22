import React from "react";
import { Navigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";

function RoleRoute({ children, role }) {
  const { user, isAuthenticated } = useAppAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (user && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

export default RoleRoute;