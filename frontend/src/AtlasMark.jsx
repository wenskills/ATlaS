import { useEffect, useId, useState } from "react";

function AtlasMark({ size = 48, animated = false, loop = false }) {
  const [drawn, setDrawn] = useState(!animated);
  const gradientId = `atlas-peak-grad-${useId()}`;

  useEffect(() => {
    if (!animated) return;
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [animated]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`atlas-mark ${loop ? "atlas-mark-loop" : ""}`}
      role="img"
      aria-label="ATlaS"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <line x1="50" y1="32" x2="28" y2="66" className="atlas-mark-leader" />
      <line x1="50" y1="32" x2="72" y2="66" className="atlas-mark-leader" />
      <polygon
        points="50,12 31,80 69,80"
        className="atlas-mark-peak"
        style={{
          stroke: `url(#${gradientId})`,
          strokeDasharray: 220,
          strokeDashoffset: drawn ? 0 : 220,
        }}
      />
      <line x1="40" y1="40" x2="60" y2="40" className="atlas-mark-scan" />
      <circle cx="28" cy="66" r="3.6" className="atlas-mark-dot-cyan" />
      <circle cx="72" cy="66" r="3.6" className="atlas-mark-dot-purple" />
      <circle cx="50" cy="32" r="5.2" className="atlas-mark-dot" />
    </svg>
  );
}

export default AtlasMark;
