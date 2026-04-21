
import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="home-container">

      <h1 style={{ fontSize: "80px" }}>404</h1>

      <p>Oops! Page not found 😢</p>

      <button onClick={() => navigate("/")}>
        Go Home
      </button>

    </div>
  );
}

export default NotFound;