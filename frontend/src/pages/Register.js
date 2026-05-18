
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { sendOTP, verifyOTP } from "../services/api";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

function Register() {
  const navigate = useNavigate();
  const { register, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });

  const [step, setStep] = useState("account"); // account, verify, complete
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextFromAccount = async (e) => {
    e && e.preventDefault();
    setError("");
    setStatusMessage("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill name, email and password to continue");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setStatusMessage("Sending verification OTP...");
      await sendOTP(formData.email.trim().toLowerCase());
      setOtpSent(true);
      setStatusMessage("OTP sent. Enter the code to verify your email.");
      setStep("verify");
    } catch (err) {
      setStatusMessage("");
      setError(
        err.response?.data?.message || err.message || "Failed to send OTP"
      );
    }
  };

  const handleVerifyAndNext = async (e) => {
    e && e.preventDefault();
    setError("");
    setStatusMessage("");

    if (!formData.otp) {
      setError("Please enter the OTP to continue");
      return;
    }

    setVerifying(true);
    try {
      await verifyOTP(formData.email.trim().toLowerCase(), formData.otp.trim());
      setStatusMessage("Email verified — ready to complete registration.");
      setStep("complete");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async (e) => {
    e && e.preventDefault();
    setError("");

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your Account</h2>

        <div className="register-stepper">
          <div className={`step ${step === 'account' ? 'active' : ''}`}>1. Account Info</div>
          <div className={`step ${step === 'verify' ? 'active' : ''}`}>2. Verify</div>
          <div className={`step ${step === 'complete' ? 'active' : ''}`}>3. Complete</div>
        </div>

        {step === 'account' && (
          <form onSubmit={handleNextFromAccount}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

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
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Optional phone number"
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
                placeholder="Create a password"
              />
              <label className="show-password-toggle">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((prev) => !prev)}
                />
                Show password
              </label>
              <PasswordStrengthMeter password={formData.password} />
            </div>

            {statusMessage && <div className="success-message">{statusMessage}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button type="button" className="auth-btn secondary" onClick={() => window.history.back()}>
                Cancel
              </button>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Next'}
              </button>
            </div>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyAndNext}>
            <div className="otp-instructions">
              <p>We've sent an OTP to {formData.email}</p>
              <p>Enter the 6-digit code to verify your email.</p>
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

            {statusMessage && <div className="success-message">{statusMessage}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button type="button" className="auth-btn secondary" onClick={() => setStep('account')}>
                Previous
              </button>
              <button type="submit" className="auth-btn" disabled={verifying || loading}>
                {verifying ? 'Verifying...' : 'Next'}
              </button>
            </div>
          </form>
        )}

        {step === 'complete' && (
          <form onSubmit={handleRegister}>
            <div className="form-summary">
              <h4>Confirm your details</h4>
              <div className="summary-row"><strong>Name:</strong> {formData.name}</div>
              <div className="summary-row"><strong>Email:</strong> {formData.email}</div>
              <div className="summary-row"><strong>Phone:</strong> {formData.phone || '—'}</div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button type="button" className="auth-btn secondary" onClick={() => setStep('verify')}>
                Previous
              </button>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;