"""Base de connaissances vectorisee pour le RAG.

On reutilise le meme modele SBERT que le matching semantique (pas de
dependance supplementaire type ChromaDB/FAISS necessaire a cette echelle:
une dizaine de notices tiennent largement en memoire). Les embeddings sont
calcules une seule fois au demarrage puis caches.

A l'echelle, on remplacerait `_KB_EMBEDDINGS` par un vrai vector store
(ChromaDB, pgvector, Pinecone) mais le contrat (retrieve(query, k)) resterait
identique - c'est ce qui rend ce module facile a faire evoluer.
"""
from __future__ import annotations

import json
from pathlib import Path

from sklearn.metrics.pairwise import cosine_similarity

from app.services.semantic_matching import get_model

_KB_PATH = Path(__file__).resolve().parent.parent / "data" / "recruiter_knowledge_base.json"

with open(_KB_PATH, encoding="utf-8") as f:
    _KB_DOCS: list[dict] = json.load(f)

_KB_EMBEDDINGS = None


def _ensure_embeddings():
    global _KB_EMBEDDINGS
    if _KB_EMBEDDINGS is None:
        model = get_model()
        texts = [doc["text"] for doc in _KB_DOCS]
        _KB_EMBEDDINGS = model.encode(texts)
    return _KB_EMBEDDINGS


def retrieve(query: str, k: int = 4) -> list[dict]:
    """Retourne les k notices de la base de connaissances les plus
    pertinentes par rapport a une requete (etape "retrieval" du RAG).
    """
    model = get_model()
    embeddings = _ensure_embeddings()

    query_emb = model.encode([query])
    similarities = cosine_similarity(query_emb, embeddings)[0]

    ranked_idx = similarities.argsort()[::-1][:k]
    return [
        {**_KB_DOCS[i], "relevance": round(float(similarities[i]), 3)}
        for i in ranked_idx
    ]
