import React from "react";

const PasswordStrengthMeter = ({ password }) => {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase", met: /[a-z]/.test(password) },
    { label: "Contains a digit", met: /\d/.test(password) },
    { label: "Contains special character", met: /[@$!%*?&]/.test(password) },
  ];

  const strengthCount = checks.filter((c) => c.met).length;
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Excellent"];
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

  return (
    <div className="password-strength-meter" style={{ marginTop: "1rem" }}>
      <div className="strength-bar-container" style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden", marginBottom: "0.5rem" }}>
        <div 
          className="strength-bar" 
          style={{ 
            height: "100%", 
            width: `${(strengthCount / 5) * 100}%`, 
            background: strengthColors[strengthCount - 1] || "#f3f4f6",
            transition: "width 0.3s ease, background 0.3s ease" 
          }} 
        />
      </div>
      
      <div className="strength-text" style={{ fontSize: "0.85rem", fontWeight: "600", color: strengthColors[strengthCount - 1] || "#6b7280", marginBottom: "0.75rem" }}>
        Strength: {strengthLabels[strengthCount - 1] || "None"}
      </div>

      <ul className="strength-checklist" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {checks.map((check, idx) => (
          <li key={idx} style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", marginBottom: "4px", color: check.met ? "#22c55e" : "#9ca3af" }}>
            <span style={{ marginRight: "8px" }}>{check.met ? "✅" : "❌"}</span>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
