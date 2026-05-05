
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
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [credentialsVerified, setCredentialsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");
    setDevOtp("");

    if (!formData.email || !formData.password) {
      setError("Please enter email and password first");
      return;
    }

    setVerifying(true);
    try {
      await verifyCredentials({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setCredentialsVerified(true);
      setStatusMessage("Credentials verified. Click Send OTP to continue.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setVerifying(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");
    setDevOtp("");

    if (!credentialsVerified) {
      setError("Please verify your email and password before sending OTP.");
      return;
    }

    setSendingOtp(true);
    try {
      const response = await sendOTP(formData.email.trim().toLowerCase());
      setStatusMessage("OTP sent successfully. Enter it below to log in.");
      setStep("otp");
      setDevOtp(response.data?.otp || "");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to send OTP"
      );
    } finally {
      setSendingOtp(false);
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
      navigate("/progress");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");
    setDevOtp("");

    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    setSendingOtp(true);
    try {
      const response = await forgotPassword(resetEmail.trim().toLowerCase());
      setStatusMessage("Password reset OTP sent to your email");
      setStep("resetPassword");
      setDevOtp(response.data?.otp || "");
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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Smart Study Planner</h2>

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
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            {statusMessage && <div className="success-message">{statusMessage}</div>}
            {devOtp && (
              <div className="info-message">
                Dev OTP: <strong>{devOtp}</strong>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button
                type="button"
                className="auth-btn"
                onClick={handleVerifyCredentials}
                disabled={verifying || loading}
              >
                {verifying ? "Verifying..." : "Verify Credentials"}
              </button>

              <button
                type="button"
                className="auth-btn secondary"
                onClick={handleSendOTP}
                disabled={!credentialsVerified || sendingOtp || verifying || loading}
              >
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
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
            {devOtp && (
              <div className="info-message">
                Dev OTP: <strong>{devOtp}</strong>
              </div>
            )}
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
            {devOtp && (
              <div className="info-message">
                Dev OTP: <strong>{devOtp}</strong>
              </div>
            )}
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

        <div className="auth-links">
          <p>
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => setStep("forgotPassword")}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </p>
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;