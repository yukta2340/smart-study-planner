
import React, { useEffect, useState } from "react";
import { SignUp, useAuth, useClerk } from "@clerk/clerk-react";

function Register() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepareSignUp = async () => {
      if (!isLoaded) return;

      if (isSignedIn) {
        try {
          // Force a fresh signup flow instead of reusing the active session.
          await signOut();
        } catch (err) {
          console.error("Failed to sign out before signup:", err);
        }
      }

      setReady(true);
    };

    prepareSignUp();
  }, [isLoaded, isSignedIn, signOut]);

  if (!ready) {
    return (
      <div className="auth-page">
        <div className="auth-clerk-wrap">Loading signup...</div>
      </div>
    );
  }

  return (
    <div className="auth-page">
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