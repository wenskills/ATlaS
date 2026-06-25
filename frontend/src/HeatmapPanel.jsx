import { useState } from "react";
import BrandLoader from "./BrandLoader";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const LEVEL_LABELS = {
  strong: "Fort match",
  medium: "Match partiel",
  weak: "Faible / absent",
};

function HeatmapPanel({ jobOffer, cvFile }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("job_offer", jobOffer);
      formData.append("cv_file", cvFile);
      const response = await fetch(`${API_URL}/api/heatmap`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Erreur pendant la génération de la heatmap.");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="advisor-empty">
        {loading ? (
          <div className="advisor-loading">
            <BrandLoader size={32} />
            <span>Extraction des coordonnées du PDF et calcul des correspondances...</span>
          </div>
        ) : (
          <>
            <p>
              Visualise directement sur ton CV quelles phrases correspondent fortement à
              l'offre, lesquelles sont partielles, et lesquelles sont absentes — superposé sur
              le vrai document, pas sur du texte recopié.
            </p>
            <button type="button" onClick={handleGenerate}>
              GÉNÉRER LA HEATMAP
            </button>
          </>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  return (
    <div className="heatmap-content">
      <div className="heatmap-legend">
        <span className="heatmap-leg-item">
          <span className="heatmap-dot strong" /> Fort match
        </span>
        <span className="heatmap-leg-item">
          <span className="heatmap-dot medium" /> Match partiel
        </span>
        <span className="heatmap-leg-item">
          <span className="heatmap-dot weak" /> Faible / absent
        </span>
        <span className="heatmap-coverage">
          Couverture forte : <strong>{Math.round(data.coverage_ratio * 100)}%</strong>
        </span>
      </div>

      {data.pages.map((page) => (
        <div
          className="heatmap-page"
          key={page.page_index}
          style={{ aspectRatio: `${page.width} / ${page.height}` }}
        >
          <img
            src={`data:image/png;base64,${page.image_base64}`}
            alt={`CV page ${page.page_index + 1}`}
          />
          {page.lines
            .filter((line) => line.level !== "neutral")
            .map((line, idx) => {
              const [x0, y0, x1, y1] = line.bbox;
              return (
                <div
                  key={idx}
                  className={`heatmap-overlay ${line.level}`}
                  title={`${LEVEL_LABELS[line.level]} (${line.score})`}
                  style={{
                    left: `${(x0 / page.width) * 100}%`,
                    top: `${(y0 / page.height) * 100}%`,
                    width: `${((x1 - x0) / page.width) * 100}%`,
                    height: `${((y1 - y0) / page.height) * 100}%`,
                  }}
                />
              );
            })}
        </div>
      ))}
    </div>
  );
}

export default HeatmapPanel;
