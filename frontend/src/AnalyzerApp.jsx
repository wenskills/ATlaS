import { useState } from "react";
import "./App.css";
import BrandLoader from "./BrandLoader";
import AtlasCube from "./AtlasCube";
import ScoreGauge from "./ScoreGauge";
import WeightSimulator from "./WeightSimulator";
import DiagnosticZone from "./DiagnosticZone";
import AIRecommendations from "./AIRecommendations";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const STEPS = [
  { key: "input", label: "Tes informations", tech: "Offre + CV" },
  { key: "score", label: "Ton score ATS", tech: "BM25 + SBERT" },
  { key: "diagnostic", label: "Diagnostic détaillé", tech: "Compétences + heatmap" },
  { key: "recommendations", label: "Recommandations IA", tech: "RAG + Gemini" },
  { key: "gaps", label: "Points à renforcer", tech: "Écarts sémantiques" },
];

function AnalyzerApp() {
  const [jobOffer, setJobOffer] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState("input");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobOffer || !cvFile) {
      setError("Ajoute une offre et un CV PDF.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("job_offer", jobOffer);
      formData.append("cv_file", cvFile);
      const response = await fetch(`${API_URL}/api/match`, { method: "POST", body: formData });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.detail || "Erreur pendant l'analyse.");
      }
      const data = await response.json();
      setAnalysis(data);
      setActiveStep("score");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uncoveredGaps = analysis
    ? analysis.weakest_sentence_gaps.filter((g) => !g.covered)
    : [];

  return (
    <main className="atlas-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow fade-up">SEMANTIC ATS MATCHING</p>
          <h2 className="fade-up" style={{ animationDelay: "0.08s" }}>
            Analyse ton CV comme le ferait un ATS
          </h2>
          <p className="subtitle fade-up" style={{ animationDelay: "0.16s" }}>
            Score composite pondéré, compétences manquantes détectées, et plan
            d'amélioration généré par IA à partir d'une base de connaissances RH.
          </p>
        </div>
        <div className="hero-visual fade-up" style={{ animationDelay: "0.24s" }}>
          <div className="hero-visual-frame">
            <AtlasCube size={130} />
          </div>
        </div>
      </section>

      <div className="workspace">
        <aside className="step-rail">
          {STEPS.map((step, idx) => {
            const isEnabled = step.key === "input" || analysis;
            const isActive = activeStep === step.key;
            return (
              <button
                key={step.key}
                type="button"
                className={`step-item ${isActive ? "active" : ""} ${!isEnabled ? "disabled" : ""}`}
                onClick={() => isEnabled && setActiveStep(step.key)}
                disabled={!isEnabled}
              >
                <span className="step-marker">
                  <span className="step-dot" />
                  {idx < STEPS.length - 1 && <span className="step-line" />}
                </span>
                <span className="step-text">
                  <span className="step-label">{step.label}</span>
                  <span className="step-tech">{step.tech}</span>
                </span>
              </button>
            );
          })}
        </aside>

        <div className="step-content">
          {activeStep === "input" && (
            <form className="panel input-panel" onSubmit={handleSubmit}>
              <h3>Tes informations</h3>

              <label className="field">
                <span>Offre d'emploi</span>
                <textarea
                  value={jobOffer}
                  onChange={(e) => setJobOffer(e.target.value)}
                  placeholder="Colle ici la description complète de l'offre..."
                />
              </label>

              <label className="field">
                <span>CV candidat (PDF)</span>
                <div className="upload-box">
                  <div className="file-icon">▤</div>
                  <div className="upload-text">
                    <strong>Glissez-déposez votre fichier PDF ici</strong>
                    <small>ou parcourez votre ordinateur</small>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCvFile(e.target.files[0])}
                  />
                </div>
                <div className={`file-row ${cvFile ? "active" : ""}`}>
                  <span>↳</span>
                  <strong>{cvFile ? cvFile.name : "Aucun fichier sélectionné"}</strong>
                  {cvFile && <em>ok</em>}
                </div>
              </label>

              <button type="submit" disabled={loading}>
                {loading && <BrandLoader size={18} />}
                {loading ? "ANALYSE EN COURS..." : "LANCER L'ANALYSE"}
              </button>

              {error && <p className="error-text">{error}</p>}
            </form>
          )}

          {activeStep === "score" && (
            <div className="panel score-panel">
              <h3>Ton score ATS</h3>
              {!analysis ? (
                <div className="empty-state">
                  <BrandLoader size={70} />
                  <h4>Lance d'abord une analyse</h4>
                  <p>Retourne à l'étape « Tes informations » pour commencer.</p>
                </div>
              ) : (
                <>
                  <ScoreGauge score={analysis.scores.global_score} label={analysis.scores.label} />
                  <div className="score-grid">
                    {Object.entries(analysis.scores.breakdown).map(([key, value]) => (
                      <div className={`score-box accent-${accentForCriterion(key)}`} key={key}>
                        <small>{labelForCriterion(key)}</small>
                        <h4>{value}</h4>
                        <div className="bar">
                          <div className="bar-fill" style={{ width: `${value * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <WeightSimulator
                    breakdown={analysis.scores.breakdown}
                    officialScore={analysis.scores.global_score}
                  />
                </>
              )}
            </div>
          )}

          {activeStep === "diagnostic" && analysis && (
            <DiagnosticZone analysis={analysis} jobOffer={jobOffer} cvFile={cvFile} />
          )}

          {activeStep === "recommendations" && analysis && (
            <AIRecommendations jobOffer={jobOffer} cvFile={cvFile} />
          )}

          {activeStep === "gaps" && (
            <div className="panel gaps-panel">
              <h3>Points à renforcer en priorité</h3>
              {uncoveredGaps.length === 0 ? (
                <p className="gaps-intro">
                  Aucun écart sémantique majeur détecté — ton CV couvre bien les exigences de
                  l'offre sur ce plan.
                </p>
              ) : (
                <>
                  <p className="gaps-intro">
                    Pour chaque exigence de l'offre ci-dessous, le passage du CV le plus proche
                    sémantiquement reste faible (ou absent).
                  </p>
                  <div className="gaps-list">
                    {uncoveredGaps.map((gap, idx) => (
                      <div className="gap-row" key={idx} style={{ animationDelay: `${idx * 0.06}s` }}>
                        <p className="gap-job">{gap.job_sentence}</p>
                        {gap.has_match ? (
                          <p className="gap-cv">
                            le plus proche dans le CV : « {gap.best_cv_match} » <em>({gap.score})</em>
                          </p>
                        ) : (
                          <p className="gap-nomatch">Aucun passage du CV n'aborde clairement ce point.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function labelForCriterion(key) {
  const labels = {
    skill_coverage: "Couverture compétences",
    lexical_score: "Score lexical (BM25)",
    semantic_score: "Score sémantique (SBERT)",
    parseability: "Parseabilité",
  };
  return labels[key] || key;
}

function accentForCriterion(key) {
  const accents = {
    skill_coverage: "green",
    lexical_score: "purple",
    semantic_score: "cyan",
    parseability: "amber",
  };
  return accents[key] || "green";
}

export default AnalyzerApp;
