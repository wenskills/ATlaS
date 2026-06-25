import AtlasMark from "./AtlasMark";
import AtlasWordmark from "./AtlasWordmark";

function TopNav({ page, onNavigate }) {
  return (
    <header className="top-nav">
      <button className="brand" onClick={() => onNavigate("landing")}>
        <AtlasMark size={42} />
        <AtlasWordmark size="1.25rem" showTagline />
      </button>
      <nav className="nav-links">
        <button
          className={page === "app" ? "active" : ""}
          onClick={() => onNavigate("app")}
        >
          Produit
        </button>
        <button
          className={page === "explain" ? "active" : ""}
          onClick={() => onNavigate("explain")}
        >
          Comment ça marche
        </button>
      </nav>
      <button className="btn-primary nav-cta" onClick={() => onNavigate("app")}>
        Essayer gratuitement
      </button>
    </header>
  );
}

export default TopNav;
