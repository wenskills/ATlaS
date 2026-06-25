import AtlasCube from "./AtlasCube";
import Icon from "./Icon";

const FEATURES = [
  { icon: "chart-bar", title: "Score composite", desc: "Un score pondéré sur 4 critères, pas un chiffre opaque." },
  { icon: "puzzle", title: "Compétences manquantes", desc: "Découvre les compétences attendues par l'offre que ton CV ne mentionne pas." },
  { icon: "map", title: "Heatmap du CV", desc: "Visualise directement sur ton document quelles phrases convainquent, lesquelles non." },
  { icon: "sliders", title: "Simulateur de pondération", desc: "Explore comment ton score change selon la logique de l'ATS visé." },
  { icon: "sparkles", title: "Conseiller IA (RAG)", desc: "Un plan d'action concret, basé sur tes scores réels et des bonnes pratiques RH." },
  { icon: "mail", title: "Lettre de motivation IA", desc: "Générée à partir de ton CV et de l'offre, prête à être envoyée." },
  { icon: "rocket", title: "Feuille de route carrière", desc: "Un plan à 6 mois honnête : compétences rattrapables avec délai réaliste." },
  { icon: "search", title: "Moteur BM25 + SBERT", desc: "La même logique de matching que les ATS du marché, mots-clés et sens combinés." },
];

function Landing({ onStart }) {
  return (
    <div className="landing-flow">
      <section className="landing-hero">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="landing-copy fade-up">
          <div className="landing-badge">
            <Icon name="sparkles" /> Analyse en quelques secondes
          </div>
          <h1>
            Sois lu par les ATS,
            <br />
            <span className="accent">pas écarté.</span>
          </h1>
          <p className="landing-sub">
            Colle ton CV et l'offre. Score composite, compétences manquantes et plan
            d'action généré par IA — gratuit, sans compte, rien n'est stocké.
          </p>
          <div className="trust-row">
            <span className="trust-item">
              <Icon name="lock" /> Rien n'est conservé
            </span>
            <span className="trust-item">
              <Icon name="coin-off" /> 100% gratuit
            </span>
            <span className="trust-item">
              <Icon name="brand-github" /> Open source
            </span>
          </div>
          <div className="landing-cta-row">
            <button className="btn-primary" onClick={onStart}>
              Analyser mon CV <Icon name="arrow-right" />
            </button>
          </div>
        </div>

        <div className="hero-scene fade-up" style={{ animationDelay: "0.15s" }}>
          <span className="float-chip fc-1">
            <Icon name="search" size={13} /> BM25
          </span>
          <span className="float-chip fc-2">
            <Icon name="sparkles" size={13} /> Gemini RAG
          </span>
          <span className="float-chip fc-3">
            <Icon name="brain" size={13} /> SBERT
          </span>
          <div className="hero-visual-frame">
            <AtlasCube size={130} />
          </div>
        </div>
      </section>

      <div className="tech-strip">
        <span>
          <b>BM25</b> · matching lexical
        </span>
        <span>
          <b>SBERT</b> · matching sémantique
        </span>
        <span>
          <b>Gemini</b> · plan d'action RAG
        </span>
        <span>
          <b>FastAPI + React</b> · stack
        </span>
      </div>

      <section className="features-section">
        <p className="eyebrow" style={{ textAlign: "center" }}>
          TOUT CE QU'IL TE FAUT
        </p>
        <h2 className="features-title">Une analyse complète, pas juste un score</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">
                <Icon name={f.icon} size={18} strokeWidth={1.6} />
              </div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
        <button className="btn-primary features-cta" onClick={onStart}>
          Essayer maintenant <Icon name="arrow-right" />
        </button>
      </section>
    </div>
  );
}

export default Landing;
