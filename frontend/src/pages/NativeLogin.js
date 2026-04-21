import React, { useState } from "react";
import { useAppAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function NativeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAppAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login(email, password);
      navigate("/planner");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="card" style={{ background: "white", padding: "2.5rem", borderRadius: "1.5rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.5rem", color: "#1f2937" }}>Welcome Back</h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Log in to your study planner</p>

        {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>Email Address</label>
            <input
              type="email"
              required
              className="auth-input"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "1rem" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>Password</label>
            <input
              type="password"
              required
              className="auth-input"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "1rem" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.875rem", borderRadius: "0.5rem", background: "#4f46e5", color: "white", fontSize: "1rem", fontWeight: "700", border: "none", cursor: "pointer" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <p style={{ marginTop: "1.5rem", textAlign: "center", color: "#6b7280" }}>
          Don't have an account? <Link to="/register" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "600" }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default NativeLogin;
