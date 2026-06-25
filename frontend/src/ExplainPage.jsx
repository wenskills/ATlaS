import Icon from "./Icon";

const EXPLAIN_CARDS = [
  {
    icon: "search",
    title: "Recherche par mots-clés",
    tag: "BM25",
    desc: "Compare les mots exacts de ton CV à ceux de l'offre — comme le ferait un moteur de recherche classique.",
  },
  {
    icon: "brain",
    title: "Compréhension du sens",
    tag: "SBERT",
    desc: "Reconnaît une compétence même formulée différemment — « gestion d'équipe » et « encadrement » sont compris comme proches.",
  },
  {
    icon: "puzzle",
    title: "Détection de compétences",
    tag: "Taxonomie",
    desc: "Repère les compétences techniques citées dans l'offre et vérifie si elles apparaissent dans ton CV.",
  },
  {
    icon: "sparkles",
    title: "Conseils personnalisés",
    tag: "RAG + Gemini",
    desc: "Une IA va chercher des bonnes pratiques RH, puis rédige des conseils basés sur tes résultats réels — pas des conseils génériques.",
  },
];

function ExplainPage() {
  return (
    <div className="explain-page">
      <p className="eyebrow">COMMENT ÇA MARCHE</p>
      <h2>Le jargon technique, en clair</h2>
      <p className="explain-intro">
        En coulisses, ATlaS utilise plusieurs techniques d'analyse de texte. Voici ce qu'elles
        font, sans le jargon — parce qu'un recruteur RH n'a pas à connaître la différence entre
        BM25 et SBERT pour comprendre ton score.
      </p>
      <div className="explain-grid">
        {EXPLAIN_CARDS.map((card) => (
          <div className="explain-card" key={card.tag}>
            <div className="explain-card-top">
              <div className="explain-icon">
                <Icon name={card.icon} size={18} strokeWidth={1.6} />
              </div>
              <div>
                <div className="explain-card-title">{card.title}</div>
                <div className="explain-card-tag">{card.tag}</div>
              </div>
            </div>
            <div className="explain-card-desc">{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExplainPage;
