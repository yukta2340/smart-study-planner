
import React, { useRef } from "react";

function TiltCard({ children }) {
  const cardRef = useRef();

  return (
    <div
      ref={cardRef}
      style={{
        transformStyle: "preserve-3d",
        transition: "0.2s ease",
      }}
    >
      {children}
    </div>
  );
}

export default TiltCard;


