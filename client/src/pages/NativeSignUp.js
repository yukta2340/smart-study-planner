import React, { useState } from "react";
import { registerUser } from "../services/api";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useNavigate } from "react-router-dom";

function NativeSignUp() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(formData);
      alert("Registration successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <div className="card" style={{ background: "white", padding: "2.5rem", borderRadius: "1.5rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "450px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem", color: "#1f2937" }}>Create Account</h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Join Smart Study Planner today</p>

        {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>Full Name</label>
            <input
              type="text"
              required
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "1rem" }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>Email Address</label>
            <input
              type="email"
              required
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "1rem" }}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@example.com"
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>Password</label>
            <input
              type="password"
              required
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "1rem" }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
            <PasswordStrengthMeter password={formData.password} />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.875rem", borderRadius: "0.5rem", background: "#4f46e5", color: "white", fontSize: "1rem", fontWeight: "700", border: "none", cursor: "pointer", transition: "background 0.2s" }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NativeSignUp;
