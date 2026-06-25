import HeatmapPanel from "./HeatmapPanel";

function DiagnosticZone({ analysis, jobOffer, cvFile }) {
  return (
    <div className="panel diagnostic-zone">
      <h3>Diagnostic détaillé</h3>
      <p className="ai-zone-intro">
        Les compétences détectées de part et d'autre, puis la même analyse appliquée
        directement sur ton CV, ligne par ligne.
      </p>

      <div className="skills-columns diagnostic-skills">
        <div>
          <strong className="skills-label matched">
            Présentes dans le CV ({analysis.skills.matched_skills.length})
          </strong>
          <div className="chip-row">
            {analysis.skills.matched_skills.map((s, idx) => (
              <span className="chip chip-ok" key={s} style={{ animationDelay: `${idx * 0.03}s` }}>
                {s}
              </span>
            ))}
            {analysis.skills.matched_skills.length === 0 && <small>Aucune</small>}
          </div>
        </div>
        <div>
          <strong className="skills-label missing">
            Manquantes par rapport à l'offre ({analysis.skills.missing_skills.length})
          </strong>
          <div className="chip-row">
            {analysis.skills.missing_skills.map((s, idx) => (
              <span className="chip chip-missing" key={s} style={{ animationDelay: `${idx * 0.03}s` }}>
                {s}
              </span>
            ))}
            {analysis.skills.missing_skills.length === 0 && <small>Aucune — couverture complète</small>}
          </div>
        </div>
      </div>

      <div className="diagnostic-divider">
        <span>Heatmap du CV</span>
      </div>

      <HeatmapPanel jobOffer={jobOffer} cvFile={cvFile} />
    </div>
  );
}

export default DiagnosticZone;
