const LABELS = {
  skill_coverage: "Compétences",
  lexical_score: "Lexical",
  semantic_score: "Sémantique",
  parseability: "Parseabilité",
};

function RadarChart({ breakdown }) {
  const keys = Object.keys(LABELS);
  const values = keys.map((k) => breakdown[k]);
  const size = 220;
  const center = size / 2;
  const radius = 78;
  const angleStep = (Math.PI * 2) / keys.length;
  const angleFor = (i) => -Math.PI / 2 + i * angleStep;

  const axisPoints = keys.map((_, i) => {
    const angle = angleFor(i);
    return [center + radius * Math.cos(angle), center + radius * Math.sin(angle)];
  });

  const shapePoints = values.map((v, i) => {
    const angle = angleFor(i);
    const r = radius * Math.max(v, 0.04);
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar-chart">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={axisPoints
            .map(([x, y]) => `${center + (x - center) * scale},${center + (y - center) * scale}`)
            .join(" ")}
          className="radar-grid"
        />
      ))}
      {axisPoints.map(([x, y], i) => (
        <line key={i} x1={center} y1={center} x2={x} y2={y} className="radar-axis" />
      ))}
      <polygon points={shapePoints.map((p) => p.join(",")).join(" ")} className="radar-shape" />
      {shapePoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" className="radar-point" />
      ))}
      {keys.map((key, i) => {
        const angle = angleFor(i);
        const lx = center + (radius + 28) * Math.cos(angle);
        const ly = center + (radius + 28) * Math.sin(angle);
        return (
          <text key={key} x={lx} y={ly} textAnchor="middle" className="radar-label">
            {LABELS[key]}
          </text>
        );
      })}
    </svg>
  );
}

export default RadarChart;
