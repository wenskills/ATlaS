import AtlasMark from "./AtlasMark";
import AtlasWordmark from "./AtlasWordmark";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <AtlasMark size={28} />
        <AtlasWordmark size="1.1rem" />
      </div>
      <div className="footer-links">
        <a href="https://github.com" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <span>BM25 · SBERT · RAG · Gemini</span>
      </div>
      <p className="footer-note">
        Projet open source — aucune donnée n'est conservée. Construit avec FastAPI + React.
      </p>
    </footer>
  );
}

export default Footer;
