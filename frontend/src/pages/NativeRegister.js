import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";

function NativeRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await registerUser(form);
      
      if (response.data.success !== false) {
        // Registration successful
        alert("Registration successful! Please log in with your new account.");
        navigate("/native-login");
      } else {
        setError(response.data.message || "Registration failed.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please check your inputs.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{
        maxWidth: 420,
        margin: "80px auto",
        padding: "40px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "white",
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>
          <span style={{ color: "#6366f1" }}>Create</span> Account
        </h2>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid #ef4444",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            color: "#ef4444",
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#a5b4fc" }}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                fontSize: 16,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#a5b4fc" }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                fontSize: 16,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 30 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#a5b4fc" }}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 chars)"
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                fontSize: 16,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 8,
              border: "none",
              background: loading ? "#4c4c4c" : "#6366f1",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "#94a3b8" }}>
          Already have an account?{" "}
          <Link to="/native-login" style={{ color: "#6366f1", textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default NativeRegister;