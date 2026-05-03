import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmailAPI } from "../services/api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmailAPI(token);
        if (response.data.success || response.data.message.includes("successfully")) {
          setStatus("success");
          setMessage(response.data.message || "Email verified successfully!");
          // Redirect to login after 3 seconds
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(response.data.message || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Invalid or expired verification token.");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className="verify-email-card" style={{
        maxWidth: 450,
        margin: "100px auto",
        padding: "40px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        textAlign: "center",
        color: "white",
      }}>
        {status === "verifying" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
            <h2>Verifying your email...</h2>
            <p style={{ color: "#a5b4fc" }}>Please wait while we verify your email address.</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
            <h2 style={{ color: "#22c55e" }}>Email Verified!</h2>
            <p style={{ color: "#a5b4fc", marginBottom: 20 }}>{message}</p>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Redirecting to login...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>❌</div>
            <h2 style={{ color: "#ef4444" }}>Verification Failed</h2>
            <p style={{ color: "#a5b4fc", marginBottom: 20 }}>{message}</p>
            <button
              onClick={() => navigate("/register")}
              style={{
                background: "#6366f1",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              Go to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;