import { useState } from "react";
import RadarChart from "./RadarChart";

const DEFAULT_WEIGHTS = {
  skill_coverage: 0.4,
  lexical_score: 0.2,
  semantic_score: 0.25,
  parseability: 0.15,
};

const LABELS = {
  skill_coverage: "Couverture compétences",
  lexical_score: "Score lexical (BM25)",
  semantic_score: "Score sémantique (SBERT)",
  parseability: "Parseabilité",
};

function WeightSimulator({ breakdown, officialScore }) {
  const [open, setOpen] = useState(false);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const normalized = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / total])
  );
  const simulatedScore = Object.entries(normalized).reduce(
    (sum, [k, w]) => sum + w * breakdown[k],
    0
  );

  const handleChange = (key) => (e) => {
    setWeights((w) => ({ ...w, [key]: parseFloat(e.target.value) }));
  };

  if (!open) {
    return (
      <button type="button" className="simulator-toggle" onClick={() => setOpen(true)}>
        EXPLORER D'AUTRES PONDÉRATIONS
      </button>
    );
  }

  const delta = simulatedScore - officialScore;

  return (
    <div className="simulator">
      <p className="simulator-intro">
        Les ATS réels ne pondèrent pas tous les critères de la même façon. Ajuste les curseurs
        pour voir comment le score évoluerait avec une autre logique de pondération.
      </p>
      <div className="simulator-body">
        <RadarChart breakdown={breakdown} />
        <div className="simulator-controls">
          {Object.entries(normalized).map(([key, val]) => (
            <label className="simulator-slider" key={key}>
              <span>
                {LABELS[key]} <strong>{(val * 100).toFixed(0)}%</strong>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights[key]}
                onChange={handleChange(key)}
              />
            </label>
          ))}
        </div>
      </div>
      <div className="simulator-compare">
        <div>
          <small>Score officiel (pondération standard)</small>
          <strong>{officialScore.toFixed(3)}</strong>
        </div>
        <div className={delta > 0.001 ? "up" : delta < -0.001 ? "down" : ""}>
          <small>Ta pondération</small>
          <strong>{simulatedScore.toFixed(3)}</strong>
        </div>
      </div>
    </div>
  );
}

export default WeightSimulator;
