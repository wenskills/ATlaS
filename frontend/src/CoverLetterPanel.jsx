import { useState } from "react";
import BrandLoader from "./BrandLoader";
import { fallbackMessageFor } from "./fallbackMessages";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TONES = [
  { key: "concis", label: "Concis" },
  { key: "dynamique", label: "Dynamique" },
  { key: "formel", label: "Formel" },
];

function CoverLetterPanel({ jobOffer, cvFile }) {
  const [tone, setTone] = useState("dynamique");
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async (selectedTone) => {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const formData = new FormData();
      formData.append("job_offer", jobOffer);
      formData.append("cv_file", cvFile);
      formData.append("tone", selectedTone);
      const response = await fetch(`${API_URL}/api/cover-letter`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Erreur pendant la génération de la lettre.");
      const result = await response.json();
      setLetter(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToneChange = (key) => {
    setTone(key);
    if (letter) generate(key);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letter.letter_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([letter.letter_text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lettre-de-motivation.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!letter) {
    return (
      <div className="advisor-empty">
        {loading ? (
          <div className="advisor-loading">
            <BrandLoader size={32} />
            <span>Rédaction de la lettre en cours...</span>
          </div>
        ) : (
          <>
            <p>
              Génère une lettre de motivation basée sur ton CV et l'offre, prête à être
              envoyée — aucune mention d'IA dans le texte généré.
            </p>
            <div className="tone-row">
              {TONES.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  className={`tone-pill ${tone === t.key ? "active" : ""}`}
                  onClick={() => setTone(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => generate(tone)}>
              GÉNÉRER LA LETTRE
            </button>
          </>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  return (
    <div className="letter-content">
      <div className="letter-toolbar">
        <div className="tone-row">
          {TONES.map((t) => (
            <button
              type="button"
              key={t.key}
              className={`tone-pill ${tone === t.key ? "active" : ""}`}
              onClick={() => handleToneChange(t.key)}
              disabled={loading}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="letter-actions">
          <button type="button" className="letter-action-btn" onClick={() => generate(tone)}>
            Régénérer
          </button>
          <button type="button" className="letter-action-btn" onClick={handleCopy}>
            {copied ? "Copié ✓" : "Copier"}
          </button>
          <button type="button" className="letter-action-btn primary" onClick={handleDownload}>
            Télécharger (.txt)
          </button>
        </div>
      </div>

      {letter.source !== "gemini_api" && (
        <p className="fallback-notice">{fallbackMessageFor(letter.fallback_reason)}</p>
      )}

      {loading ? (
        <div className="advisor-loading">
          <BrandLoader size={32} />
          <span>Rédaction de la lettre en cours...</span>
        </div>
      ) : (
        <div className="letter-doc">
          {letter.letter_text.split("\n").map((line, idx) => (
            <p key={idx}>{line || "\u00A0"}</p>
          ))}
        </div>
      )}

      <small className="plan-source">
        source : {letter.source === "gemini_api" ? "gemini api" : "modèle de repli"}
        {" · "}ce tag n'apparaît jamais dans le fichier téléchargé
      </small>
    </div>
  );
}

export default CoverLetterPanel;
