# ATlaS — Anti-Trauma for Lost Applicant Survivors

> Moteur de matching CV/offre d'emploi inspiré du fonctionnement réel des ATS (Applicant Tracking Systems), enrichi d'un conseiller IA basé sur du RAG (Retrieval-Augmented Generation) qui génère un plan d'amélioration personnalisé du CV.

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## Pourquoi ce projet

Ce projet est né d'une veille technologique sur le recrutement algorithmique et les systèmes ATS (TF-IDF, BM25, SBERT, HNSW, Learning-to-Rank). Plutôt que de rester sur l'analyse, j'ai voulu construire un système qui reproduit concrètement la logique de scoring utilisée par les ATS du marché (Greenhouse, Taleo, Workday...), puis aller plus loin avec une couche de recommandation par IA générative.

L'objectif n'est pas seulement de calculer un score de similarité, mais de **comprendre et expliquer** l'écart entre un CV et une offre — comme le ferait un consultant RH — et de proposer des actions concrètes pour le combler.

---

## Ce que le système fait

**Score lexical (BM25 + TF-IDF)** — reproduit la logique de recherche par mots-clés utilisée par la plupart des moteurs ATS réels. BM25 est l'algorithme sous-jacent d'Elasticsearch/Lucene, sur lequel s'appuient une partie des ATS du marché.

**Score sémantique (Sentence-BERT)** — capture la pertinence au-delà des mots exacts, pour détecter un bon profil mal formulé.

**Extraction de compétences par taxonomie** — matching contre un référentiel de compétences (backend, frontend, data/IA, devops, soft skills), avec liste explicite des compétences manquantes. C'est exactement la mécanique utilisée par les moteurs de mots-clés des ATS réels, rendue transparente plutôt qu'opaque.

**Score de parseabilité** — vérifie la présence de sections standards (Expérience, Formation, Compétences) et de coordonnées détectables, deux facteurs qui déterminent si un ATS réel parse correctement le CV.

**Score composite pondéré** — agrège les quatre signaux précédents avec des poids configurables, au lieu d'un score unique non interprétable.

**Conseiller IA (RAG)** — récupère les bonnes pratiques RH les plus pertinentes dans une base de connaissances vectorisée, puis demande à l'API Gemini de générer un plan d'amélioration priorisé basé sur les écarts réels détectés, pas sur des conseils génériques.

---

## Architecture

```
CV (PDF) + offre
       │
       ▼
┌─────────────────────────────┐
│  Moteur de matching ATS     │
│  BM25/TF-IDF · SBERT        │
│  Extraction compétences     │
└──────────────┬──────────────┘
               ▼
   Score composite pondéré
               │
               ▼
┌─────────────────────────────┐
│  Conseiller IA (RAG)        │
│  Base de connaissances RH   │──retrieval──▶ Gemini API (génération)
└──────────────┬──────────────┘
               ▼
   Plan d'amélioration structuré
               │
               ▼
        Frontend React
```

---

## Stack technique

```
Backend        Python 3.11 · FastAPI 0.115 · scikit-learn · sentence-transformers · rank-bm25 · pypdf · Pydantic
IA générative  API Gemini (Google) · RAG maison sur embeddings SBERT
Frontend       React 19 · Vite
Infra          Docker · docker-compose · Render (API) · Vercel (frontend)
Qualité        pytest · services découplés
```

---

## Lancer le projet en local

### Avec Docker (recommandé)

```bash
git clone <repo>
cd atlas-v2
cp backend/.env.example backend/.env
docker compose up
```

- Frontend : http://localhost:5173
- API : http://localhost:8000 — documentation interactive sur `/docs`

### Sans Docker

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

Le conseiller IA fonctionne sans clé API (mode dégradé basé sur des règles). Pour activer Gemini, renseigner `GEMINI_API_KEY` dans `backend/.env`.

---

## Tests

```bash
cd backend
pytest
```

---

## Limites connues

- L'extraction de compétences repose sur une taxonomie statique, pas sur un NER entraîné — efficace mais moins flexible qu'un vrai modèle.
- La base de connaissances RAG est volontairement compacte (démo) ; à l'échelle, elle serait remplacée par un vrai vector store (ChromaDB, pgvector).
- Le score de parseabilité travaille sur texte déjà extrait : il ne détecte pas les problèmes de mise en page visuelle (colonnes, images) qui font perdre des points aux ATS réels lors du parsing du PDF brut.
