import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { sendOTP, verifyOTP } from "../services/api";

function OTPAuth() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [step, setStep] = useState("phone"); // phone, otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 📱 Handle Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOTP(phone);
      setStep("otp");
      // Debug OTP removed - now requires real SMS
    } catch (err) {
      console.error("OTP send error:", err);
      setError(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP({ phone, otp, name });

      // Save token
      login(res.data.token);

      // Redirect to dashboard
      navigate("/planner");
    } catch (err) {
      console.error("OTP verify error:", err);
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>📱 Login with OTP</h2>

        {error && <p className="error">{error}</p>}

        {step === "phone" && (
          <form onSubmit={handleSendOTP}>
            <input
              type="tel"
              placeholder="Enter Phone Number (+91xxxxxxxxxx or 10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^+\d]/g, "").slice(0, 13))}
              maxLength="13"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ fontSize: "14px", opacity: 0.7 }}>
              OTP sent to {phone}
            </p>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength="6"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setName("");
              }}
              style={{
                background: "transparent",
                color: "#667eea",
                marginTop: "10px",
              }}
            >
              Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OTPAuth;
