# ATlaS — AI Talent Semantic Matching

> Moteur de matching CV/offre d'emploi inspire du fonctionnement reel des ATS (Applicant Tracking Systems), enrichi d'un conseiller IA base sur du RAG (Retrieval-Augmented Generation) qui genere un plan d'amelioration personnalise du CV.

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**Demo live :** _a completer une fois deploye → voir [DEPLOY.md](./docs/DEPLOY.md)_

---

## Pourquoi ce projet

Ce projet est ne d'une veille technologique que j'ai menee sur le recrutement algorithmique et les systemes ATS (TF-IDF, BM25, SBERT, HNSW, Learning-to-Rank). Plutot que de rester sur l'analyse, j'ai voulu construire un systeme qui reproduit concretement la logique de scoring utilisee par les ATS du marche (Greenhouse, Taleo, Workday...), puis aller plus loin avec une couche de recommandation par IA generative.

L'objectif n'est pas seulement de calculer un score de similarite, mais de **comprendre et expliquer** l'ecart entre un CV et une offre, comme le ferait un consultant RH — et de proposer des actions concretes pour le combler.

## Ce que le systeme fait

1. **Score lexical (BM25 + TF-IDF)** — reproduit la logique de recherche par mots-cles utilisee par la plupart des moteurs ATS reels (BM25 est l'algorithme sous-jacent d'Elasticsearch/Lucene, sur lequel s'appuient une partie des ATS du marche).
2. **Score semantique (Sentence-BERT)** — capture la pertinence au-dela des mots exacts, pour detecter un bon profil mal formule.
3. **Extraction de competences par taxonomie** — matching contre un referentiel de competences (backend, frontend, data/IA, devops, soft skills), avec liste explicite des competences manquantes : c'est exactement la mecanique utilisee par les moteurs de mots-cles des ATS reels, plus transparente qu'un score global opaque.
4. **Score de parseabilite** — verifie la presence de sections standards (Experience, Formation, Competences) et de coordonnees detectables, deux facteurs qui determinent si un ATS reel parse correctement le CV.
5. **Score composite pondere** — agrege les quatre signaux precedents (poids configurables), au lieu d'un score unique non interpretable.
6. **Conseiller IA (RAG)** — recupere les bonnes pratiques RH les plus pertinentes dans une base de connaissances vectorisee, puis demande a l'API Gemini de generer un plan d'amelioration priorise, base sur les ecarts reels detectes (pas un conseil generique).

## Architecture

```
CV (PDF) + offre
       │
       ▼
┌─────────────────────────────┐
│  Moteur de matching ATS     │
│  BM25/TF-IDF · SBERT        │
│  Extraction competences     │
└──────────────┬──────────────┘
               ▼
   Score composite pondere
               │
               ▼
┌─────────────────────────────┐
│  Conseiller IA (RAG)        │
│  Base de connaissances RH   │──retrieval──▶ Gemini API (generation)
└──────────────┬──────────────┘
               ▼
   Plan d'amelioration structure
               │
               ▼
        Frontend React
```

Le detail de chaque module est dans [docs/architecture.md](./docs/architecture.md).

## Stack technique

| Couche | Technologies |
|---|---|
| Backend | Python, FastAPI, scikit-learn, sentence-transformers, rank-bm25, pypdf |
| IA generative | API Gemini (Google), RAG (retrieval maison sur embeddings SBERT) |
| Frontend | React 19, Vite |
| Infra | Docker, docker-compose, deploiement Render (API) + Vercel (frontend) |
| Qualite | pytest, structure en services decouples, validation Pydantic |

## Lancer le projet en local

### Avec Docker (recommande)

```bash
git clone <repo>
cd atlas-v2
cp backend/.env.example backend/.env
docker compose up
```

- Frontend : http://localhost:5173
- API : http://localhost:8000 (doc interactive sur `/docs`)

### Sans Docker

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# Frontend (dans un autre terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Le conseiller IA fonctionne sans cle API (mode degrade base sur des regles). Pour activer Gemini, renseigner `GEMINI_API_KEY` dans `backend/.env`.

## Tests

```bash
cd backend
pytest
```

## Deploiement

Voir [docs/DEPLOY.md](./docs/DEPLOY.md) pour la procedure pas a pas (Render pour l'API, Vercel pour le frontend, gratuit).

## Limites connues et axes d'amelioration

Par souci de transparence (un vrai projet a des limites, et c'est aussi ca qu'un recruteur technique apprecie de voir nomme) :

- L'extraction de competences est basee sur une taxonomie statique, pas sur un NER entraine — efficace mais moins flexible qu'un vrai modele.
- La base de connaissances RAG est volontairement compacte (demo) ; a l'echelle, elle serait remplacee par un vrai vector store (ChromaDB, pgvector).
- Le score de parseabilite travaille sur texte deja extrait : il ne detecte pas les problemes de mise en page visuelle (colonnes, images) qui font perdre des points aux ATS reels lors du parsing du PDF brut.

## Licence

MIT
