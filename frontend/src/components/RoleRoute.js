
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function RoleRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  // Example: user.role should exist
  if (!user) return <Navigate to="/login" />;

  if (user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

export default RoleRoute;