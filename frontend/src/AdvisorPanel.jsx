import { useEffect, useState } from "react";
import BrandLoader from "./BrandLoader";
import { fallbackMessageFor } from "./fallbackMessages";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const LOADING_MESSAGES = [
  "Consultation de la base de connaissances RH...",
  "Génération du plan par l'IA...",
  "Ça prend plus de temps que d'habitude — forte demande côté Gemini, on patiente...",
];

function AdvisorPanel({ jobOffer, cvFile }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setMessageIndex(0);
      return;
    }
    const timers = [
      setTimeout(() => setMessageIndex(1), 2500),
      setTimeout(() => setMessageIndex(2), 7000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("job_offer", jobOffer);
      formData.append("cv_file", cvFile);
      const response = await fetch(`${API_URL}/api/advisor`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Erreur pendant la génération du plan.");
      const data = await response.json();
      setPlan(data.improvement_plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="advisor-empty">
        {loading ? (
          <div className="advisor-loading">
            <BrandLoader size={32} />
            <span>{LOADING_MESSAGES[messageIndex]}</span>
          </div>
        ) : (
          <>
            <p>
              Génère un plan d'amélioration personnalisé : le système récupère les bonnes
              pratiques RH pertinentes pour ton profil, puis demande à Gemini de produire des
              actions concrètes à partir de tes scores réels.
            </p>
            <button type="button" onClick={handleGenerate}>
              GÉNÉRER LE PLAN D'ACTION
            </button>
          </>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  return (
    <div className="plan-content">
      {plan.source !== "gemini_api" && (
        <p className="fallback-notice">{fallbackMessageFor(plan.fallback_reason)}</p>
      )}
      <p className="plan-summary">{plan.summary}</p>
      <div className="plan-actions">
        {plan.actions.map((action, idx) => (
          <div
            className={`plan-action priority-${action.priority}`}
            key={idx}
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            <span className="priority-badge">{action.priority}</span>
            <div>
              <strong>{action.action}</strong>
              <p>{action.details}</p>
            </div>
          </div>
        ))}
      </div>
      {plan.rewritten_bullet_example && (
        <div className="bullet-example">
          <small>EXEMPLE DE REFORMULATION</small>
          <p>{plan.rewritten_bullet_example}</p>
        </div>
      )}
      <small className="plan-source">
        source : {plan.source === "gemini_api" ? "gemini api" : "règles déterministes"}
      </small>
    </div>
  );
}

export default AdvisorPanel;
