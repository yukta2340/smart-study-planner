
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { sendOTP, verifyCredentials } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [step, setStep] = useState("credentials"); // credentials, otp
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [credentialsVerified, setCredentialsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState("");

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
      navigate("/planner");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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

        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;