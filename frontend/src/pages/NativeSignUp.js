import React, { useState } from "react";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { validatePasswordStrength } from "../utils/passwordValidator";
import { useNavigate, Link } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";

function NativeSignUp() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAppAuth();

  const passwordValidation = validatePasswordStrength(formData.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-brand">
            <span className="auth-brand-dot" /> Smart Study Planner
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Start your study journey with a planner built to keep you focused.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              required
              className="auth-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              required
              className="auth-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@example.com"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              required
              className="auth-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
            <PasswordStrengthMeter password={formData.password} />
            {formData.password.length > 0 && (
              <p className={`auth-strength-text ${passwordValidation.isValid ? "valid" : "invalid"}`}>
                {passwordValidation.message}
              </p>
            )}
          </div>

          <button className="auth-button" type="submit" disabled={loading || !passwordValidation.isValid}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default NativeSignUp;
