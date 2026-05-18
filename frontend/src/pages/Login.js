
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { sendOTP, verifyCredentials, forgotPassword, resetPassword } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [step, setStep] = useState("credentials"); // credentials, otp, forgotPassword, resetPassword
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendLoginOTP = async () => {
    setError("");
    setStatusMessage("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setVerifying(true);
    try {
      await verifyCredentials({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      await sendOTP(formData.email.trim().toLowerCase());
      setStatusMessage("OTP sent. Enter it below to complete login.");
      setStep("otp");
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.error || err.message || "Failed to send OTP"
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      await login(formData.email, formData.password, formData.otp);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");

    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    setSendingOtp(true);
    try {
      const response = await forgotPassword(resetEmail.trim().toLowerCase());
      setStatusMessage("Password reset OTP sent to your email");
      setStep("resetPassword");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send password reset email");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!resetToken) {
      setError("Please enter the OTP");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword({
        email: resetEmail.trim().toLowerCase(),
        otp: resetToken,
        newPassword,
      });
      setStatusMessage("Password reset successfully! You can now login with your new password.");
      setStep("credentials");
      setResetEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: 560, width: '100%' }}>
          <div className="auth-card-header">
            <h2 className="auth-title">Welcome Back!</h2>
            <p className="auth-subtitle">Login to continue your learning journey</p>
          </div>

          {step === "credentials" && (
            <form>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email or phone number"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
                <label className="show-password-toggle">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword((prev) => !prev)}
                  />
                  Show password
                </label>
              </div>

              {statusMessage && <div className="success-message">{statusMessage}</div>}
              {error && <div className="error-message">{error}</div>}

              <div className="button-group">
                <button
                  type="button"
                  className="auth-btn"
                  onClick={handleSendLoginOTP}
                  disabled={verifying || loading}
                >
                  {verifying ? "Sending OTP..." : "Login"}
                </button>
              </div>

              <div className="auth-links" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setStep("forgotPassword")}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
                <div style={{ marginTop: 8 }}>
                  Don't have an account? <Link to="/register">Sign up</Link>
                </div>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleLogin}>
              <div className="otp-instructions">
                <p>OTP sent to {formData.email}</p>
                <p>Enter the 6-digit code to login</p>
              </div>

              <div className="form-group">
                <label>OTP Code</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <button
                type="button"
                className="auth-btn secondary"
                onClick={() => setStep("credentials")}
                disabled={loading}
              >
                Back
              </button>
            </form>
          )}

          {step === "forgotPassword" && (
            <form onSubmit={handleForgotPassword}>
              <div className="form-instructions">
                <p>Enter your email address and we'll send you an OTP to reset your password.</p>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              {statusMessage && <div className="success-message">{statusMessage}</div>}
              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-btn" disabled={sendingOtp}>
                {sendingOtp ? "Sending OTP..." : "Send Reset OTP"}
              </button>

              <button
                type="button"
                className="auth-btn secondary"
                onClick={() => setStep("credentials")}
                disabled={sendingOtp}
              >
                Back to Login
              </button>
            </form>
          )}

          {step === "resetPassword" && (
            <form onSubmit={handleResetPassword}>
              <div className="form-instructions">
                <p>Enter the OTP sent to {resetEmail} and your new password.</p>
              </div>

              <div className="form-group">
                <label>OTP Code</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
              </div>

              {statusMessage && <div className="success-message">{statusMessage}</div>}
              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-btn">
                Reset Password
              </button>

              <button
                type="button"
                className="auth-btn secondary"
                onClick={() => setStep("forgotPassword")}
              >
                Back
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default Login;