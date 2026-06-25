import { useState } from "react";

function AtlasWordmark({ size = "1.4rem", showTagline = false }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="wordmark-wrap"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="wordmark" style={{ fontSize: size }}>
        <span className="wm-strong">AT</span>
        <span className="wm-soft">la</span>
        <span className="wm-strong">S</span>
      </span>
      {showTagline && <span className="wordmark-tagline">AI talent semantic matching</span>}
      <span className={`wordmark-easter-egg ${hover ? "visible" : ""}`}>
        Anti-Trauma for Lost Application Survivors
      </span>
    </div>
  );
}

export default AtlasWordmark;
