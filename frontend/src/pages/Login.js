
import React from "react";
import { SignIn } from "@clerk/clerk-react";

function Login() {
  return (
    <div className="auth-container">
      <div className="auth-clerk-wrap">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          fallbackRedirectUrl="/planner"
        />
      </div>
    </div>
  );
}

export default Login;