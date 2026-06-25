import { useEffect, useState } from "react";
import useCountUp from "./useCountUp";

const RADIUS = 64;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreGauge({ score, label }) {
  const [filled, setFilled] = useState(false);
  const animatedScore = useCountUp(filled ? score : 0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const offset = CIRCUMFERENCE * (1 - (filled ? score : 0));

  return (
    <div className="gauge">
      <div className="gauge-ring-wrap">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0e5c38" />
              <stop offset="100%" stopColor="#4fa686" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r={RADIUS} className="gauge-track" />
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            className="gauge-fill"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="gauge-readout">
          <strong>{animatedScore.toFixed(3)}</strong>
          <span>/ 1.000</span>
        </div>
      </div>
      <p className="gauge-label">{label}</p>
    </div>
  );
}

export default ScoreGauge;
