import { useState } from "react";
import BrandLoader from "./BrandLoader";
import { fallbackMessageFor } from "./fallbackMessages";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function RoadmapPanel({ jobOffer, cvFile }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("job_offer", jobOffer);
      formData.append("cv_file", cvFile);
      const response = await fetch(`${API_URL}/api/roadmap`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Erreur pendant la génération du plan.");
      const result = await response.json();
      setRoadmap(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!roadmap) {
    return (
      <div className="advisor-empty">
        {loading ? (
          <div className="advisor-loading">
            <BrandLoader size={32} />
            <span>Construction du plan à 6 mois...</span>
          </div>
        ) : (
          <>
            <p>
              Un plan honnête : les compétences manquantes sont estimées avec un délai réaliste,
              l'expérience professionnelle n'est jamais présentée comme rattrapable artificiellement.
            </p>
            <button type="button" onClick={handleGenerate}>
              GÉNÉRER MON ROADMAP
            </button>
          </>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  return (
    <div className="roadmap-content">
      {roadmap.source !== "gemini_api" && (
        <p className="fallback-notice">{fallbackMessageFor(roadmap.fallback_reason)}</p>
      )}
      <p className="plan-summary">{roadmap.summary}</p>

      {roadmap.skill_milestones.length > 0 && (
        <div className="roadmap-skills">
          <small className="roadmap-subhead">COMPÉTENCES RATTRAPABLES</small>
          <div className="roadmap-skill-list">
            {roadmap.skill_milestones.map((m, idx) => (
              <div className="roadmap-skill-row" key={idx}>
                <span className="roadmap-skill-name">{m.skill}</span>
                <span className="roadmap-skill-time">{m.estimated_time}</span>
                <span className="roadmap-skill-action">{m.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="roadmap-experience-note">
        <small>À PROPOS DE L'EXPÉRIENCE</small>
        <p>{roadmap.experience_note}</p>
      </div>

      <div className="roadmap-track">
        <div className="roadmap-line" />
        {roadmap.timeline.map((step, idx) => (
          <div className="roadmap-item" key={idx} style={{ animationDelay: `${idx * 0.08}s` }}>
            <div className="roadmap-dot" />
            <div className="roadmap-phase">{step.phase}</div>
            <div className="roadmap-title">{step.title}</div>
            <div className="roadmap-desc">{step.description}</div>
          </div>
        ))}
      </div>

      <small className="plan-source">
        source : {roadmap.source === "gemini_api" ? "gemini api" : "règles déterministes"}
      </small>
    </div>
  );
}

export default RoadmapPanel;
