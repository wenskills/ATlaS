import { useRef } from "react";

function AtlasCube({ size = 140 }) {
  const tiltRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--tilt-x", `${py * -10}deg`);
    el.style.setProperty("--tilt-y", `${px * 10}deg`);
  };

  const handleMouseLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div className="cube-stage" style={{ width: size, height: size }}>
      <div
        className="cube-tilt"
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="cube-spin">
          <div className="cube-face cube-face-front">
            <PeakGlyph />
          </div>
          <div className="cube-face cube-face-back" />
        </div>
      </div>
    </div>
  );
}

function PeakGlyph() {
  return (
    <svg viewBox="0 0 100 100" width="55%" height="55%">
      <line x1="50" y1="32" x2="28" y2="66" className="cube-leader" />
      <line x1="50" y1="32" x2="72" y2="66" className="cube-leader" />
      <polygon points="50,12 31,80 69,80" className="cube-peak" />
      <circle cx="28" cy="66" r="3" className="cube-dot-faint" />
      <circle cx="72" cy="66" r="3" className="cube-dot-faint" />
      <circle cx="50" cy="32" r="4.6" className="cube-dot" />
    </svg>
  );
}

export default AtlasCube;
