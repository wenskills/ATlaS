"""Matching lexical: TF-IDF (cosine) et BM25.

BM25 est l'algorithme de scoring de pertinence le plus repandu dans les
moteurs de recherche/ATS reels (variante d'Okapi BM25, utilisee par
Elasticsearch/Lucene, sur lesquels s'appuient une partie des ATS du marche
comme Greenhouse ou Taleo). On l'ajoute ici en complement du TF-IDF, qui
reste plus simple mais moins representatif de l'etat de l'art recherche.
"""
from __future__ import annotations

from rank_bm25 import BM25Okapi
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.preprocessing import preprocess, tokenize


def tfidf_score(job_offer: str, cv_text: str) -> float:
    documents = [preprocess(job_offer), preprocess(cv_text)]
    tfidf = TfidfVectorizer()
    matrix = tfidf.fit_transform(documents)
    score = cosine_similarity(matrix[0], matrix[1])[0][0]
    return round(float(score), 3)


def bm25_score(job_offer: str, cv_text: str) -> float:
    """Score BM25 normalise entre 0 et 1.

    BM25 n'est pas borne nativement (c'est un score de pertinence relatif
    entre documents d'un corpus), on le normalise donc avec une fonction de
    saturation logistique pour le rendre comparable aux autres scores
    du pipeline.
    """
    cv_tokens = tokenize(cv_text)
    job_tokens = tokenize(job_offer)

    if not cv_tokens or not job_tokens:
        return 0.0

    bm25 = BM25Okapi([cv_tokens])
    raw_score = bm25.get_scores(job_tokens)[0]

    # Saturation logistique : ramene un score BM25 typiquement entre 0 et ~15
    # vers une plage 0-1 lisible pour l'utilisateur.
    normalized = raw_score / (raw_score + 5) if raw_score > 0 else 0.0
    return round(float(normalized), 3)
