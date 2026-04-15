
import React from "react";
import { SignUp } from "@clerk/clerk-react";

function Register() {
  return (
    <div className="auth-container">
      <div className="auth-clerk-wrap">
        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          fallbackRedirectUrl="/planner"
        />
      </div>
    </div>
  );
}

export default Register;