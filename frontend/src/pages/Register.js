
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { sendOTP } from "../services/api";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

function Register() {
  const navigate = useNavigate();
  const { register, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });
  const [step, setStep] = useState("details"); // details, otp
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMessage("Sending OTP...");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill all fields");
      setStatusMessage("");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setStatusMessage("");
      return;
    }

    try {
      const response = await sendOTP(formData.email.trim().toLowerCase());
      setOtpSent(true);
      setStep("otp");
      setDevOtp(response.data?.otp || "");
      if (response.data?.otp) {
        setStatusMessage(`OTP sent. Use ${response.data.otp} for development testing.`);
      } else {
        setStatusMessage("OTP sent successfully. Enter it below to complete registration.");
      }
    } catch (err) {
      setStatusMessage("");
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to send OTP"
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join Smart Study Planner</h2>

        {step === "details" && (
          <form onSubmit={handleSendOTP}>
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
            {devOtp && (
              <div className="info-message">
                Dev OTP: <strong>{devOtp}</strong>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleRegister}>
            <div className="otp-instructions">
              <p>OTP sent to {formData.email}</p>
              <p>Enter the 6-digit code to complete registration</p>
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
            {devOtp && (
              <div className="info-message">
                Dev OTP: <strong>{devOtp}</strong>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Registering..." : "Complete Registration"}
            </button>

            <button
              type="button"
              className="auth-btn secondary"
              onClick={() => setStep("details")}
              disabled={loading}
            >
              Back
            </button>
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