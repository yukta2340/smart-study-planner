
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
        <div className="auth-card" style={{ maxWidth: 620, width: '100%' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎓</div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#9cc7ff', fontWeight: 700 }}>
              Smart <span style={{ color: '#c7b8ff' }}>Study AI</span>
            </h3>
          </div>

          <div className="auth-card-header">
            <h2 className="auth-title">Welcome <span style={{ color: '#7c3aed' }}>Back!</span></h2>
            <p className="auth-subtitle">Login to continue your learning journey</p>
          </div>

          {step === "credentials" && (
            <form>
              {/* 3D Illustration */}
              <div style={{
                textAlign: 'center',
                margin: '24px 0',
                padding: '32px 0',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 280
              }}>
                <svg 
                  viewBox="0 0 400 400" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: 280 }}
                >
                  <defs>
                    <radialGradient id="darkGlow" cx="50%" cy="50%">
                      <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: '#1e1b4b', stopOpacity: 0.1 }} />
                    </radialGradient>
                    <filter id="shadow">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                    </filter>
                  </defs>

                  {/* Background glow */}
                  <circle cx="200" cy="220" r="150" fill="url(#darkGlow)" filter="url(#shadow)"/>

                  {/* Sparkles */}
                  <g opacity="0.6">
                    <circle cx="320" cy="100" r="3" fill="#a78bfa"/>
                    <circle cx="80" cy="150" r="2" fill="#c4b5fd"/>
                    <circle cx="350" cy="200" r="2.5" fill="#a78bfa"/>
                    <circle cx="60" cy="250" r="2" fill="#c4b5fd"/>
                    <circle cx="320" cy="320" r="2" fill="#a78bfa"/>
                  </g>

                  {/* Book base (purple) */}
                  <g transform="translate(200, 240)">
                    <rect x="-60" y="-40" width="120" height="80" fill="#6d28d9" rx="4"/>
                    <rect x="-60" y="-40" width="120" height="15" fill="#7c3aed" rx="4"/>
                    <rect x="40" y="-35" width="8" height="50" fill="#f59e0b"/>
                  </g>

                  {/* Graduation cap */}
                  <g transform="translate(200, 160)">
                    <ellipse cx="0" cy="0" rx="50" ry="15" fill="#5b21b6"/>
                    <polygon points="0,-50 -45,5 45,5" fill="#6d28d9"/>
                    <line x1="0" y1="5" x2="0" y2="50" stroke="#f59e0b" strokeWidth="3"/>
                    <circle cx="0" cy="55" r="4" fill="#f59e0b"/>
                  </g>

                  {/* AI Cube */}
                  <g transform="translate(280, 200)">
                    <rect x="-35" y="-35" width="70" height="70" fill="#4f46e5" stroke="#7c3aed" strokeWidth="2"/>
                    <polygon points="-35,-35 -10,-55 60,-55 35,-35" fill="#6366f1" stroke="#7c3aed" strokeWidth="2"/>
                    <polygon points="35,-35 60,-55 60,15 35,35" fill="#4f46e5" stroke="#7c3aed" strokeWidth="2"/>
                    <text x="0" y="8" fontSize="24" fontWeight="bold" fill="#e0e7ff" textAnchor="middle">AI</text>
                  </g>

                  {/* Chart icon */}
                  <g transform="translate(120, 140)">
                    <rect x="-25" y="0" width="50" height="40" fill="#6d28d9" rx="4" stroke="#7c3aed" strokeWidth="2"/>
                    <rect x="-15" y="20" width="8" height="20" fill="#a78bfa"/>
                    <rect x="-3" y="15" width="8" height="25" fill="#c4b5fd"/>
                    <rect x="9" y="10" width="8" height="30" fill="#a78bfa"/>
                  </g>

                  {/* AI Label */}
                  <g transform="translate(340, 120)">
                    <rect x="-30" y="-20" width="60" height="40" fill="#5b21b6" rx="4" stroke="#7c3aed" strokeWidth="2"/>
                    <text x="0" y="8" fontSize="14" fontWeight="bold" fill="#e0e7ff" textAnchor="middle">AI</text>
                  </g>

                  {/* Decorative sparkle lines */}
                  <g stroke="#a78bfa" strokeWidth="1.5" opacity="0.5">
                    <line x1="150" y1="80" x2="160" y2="95"/>
                    <line x1="250" y1="90" x2="265" y2="100"/>
                    <line x1="100" y1="200" x2="115" y2="210"/>
                    <line x1="320" y1="250" x2="335" y2="265"/>
                  </g>
                </svg>
              </div>

              <div className="form-group">
                <label>Email or Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.2rem'
                  }}>👤</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email or phone number"
                    style={{ paddingLeft: 50 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label>Password</label>
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => setStep('forgotPassword')}
                    disabled={loading}
                    style={{ fontSize: '0.9rem', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.2rem'
                  }}>🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    style={{ paddingLeft: 50, paddingRight: 50 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      color: 'inherit',
                      padding: 0
                    }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {statusMessage && <div className="success-message">{statusMessage}</div>}
              {error && <div className="error-message">{error}</div>}

              <button
                type="button"
                className="auth-btn"
                onClick={handleSendLoginOTP}
                disabled={verifying || loading}
                style={{ marginTop: 8 }}
              >
                {verifying ? 'Sending OTP...' : 'Login'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(255,255,255,0.12)' }} />
                <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>or</span>
                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(255,255,255,0.12)' }} />
              </div>

              <button type="button" className="auth-btn secondary" style={{ marginBottom: 12 }}>
                🔵 Continue with Google
              </button>
              <button type="button" className="auth-btn secondary">
                🍎 Continue with Apple
              </button>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                Don't have an account? <Link to="/register" style={{ color: '#7c3aed', fontWeight: 600 }}>Sign up</Link>
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