import { useState } from "react";
import AdvisorPanel from "./AdvisorPanel";
import CoverLetterPanel from "./CoverLetterPanel";
import RoadmapPanel from "./RoadmapPanel";

const TABS = [
  { key: "plan", label: "Plan d'action" },
  { key: "letter", label: "Lettre de motivation" },
  { key: "roadmap", label: "Feuille de route" },
];

function AIRecommendations({ jobOffer, cvFile }) {
  const [active, setActive] = useState("plan");

  return (
    <div className="panel ai-zone">
      <h3>Recommandations IA</h3>
      <p className="ai-zone-intro">
        Trois sorties générées à partir de tes scores réels et d'une base de bonnes pratiques RH :
        un plan d'action priorisé, une lettre de motivation prête à l'emploi, et une feuille de
        route honnête pour combler les écarts.
      </p>

      <div className="ai-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`ai-tab ${active === tab.key ? "active" : ""}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="ai-tab-panel">
        {active === "plan" && <AdvisorPanel jobOffer={jobOffer} cvFile={cvFile} />}
        {active === "letter" && <CoverLetterPanel jobOffer={jobOffer} cvFile={cvFile} />}
        {active === "roadmap" && <RoadmapPanel jobOffer={jobOffer} cvFile={cvFile} />}
      </div>
    </div>
  );
}

export default AIRecommendations;
