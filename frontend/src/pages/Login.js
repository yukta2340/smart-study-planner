
import React from "react";
import { SignIn } from "@clerk/clerk-react";

function Login() {
  return (
    <div className="auth-page">
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