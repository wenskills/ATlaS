import { useState } from "react";
import "./App.css";
import TopNav from "./TopNav";
import Landing from "./Landing";
import AnalyzerApp from "./AnalyzerApp";
import ExplainPage from "./ExplainPage";
import Footer from "./Footer";

function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      <TopNav page={page} onNavigate={setPage} />
      {page === "landing" && <Landing onStart={() => setPage("app")} />}
      {page === "app" && <AnalyzerApp />}
      {page === "explain" && <ExplainPage />}
      <Footer />
    </>
  );
}

export default App;
