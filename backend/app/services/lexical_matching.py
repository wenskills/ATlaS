"""Matching lexical: TF-IDF (cosine) et BM25.
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
    cv_tokens = tokenize(cv_text)
    job_tokens = tokenize(job_offer)

    if not cv_tokens or not job_tokens:
        return 0.0

    bm25 = BM25Okapi([cv_tokens])
    raw_score = bm25.get_scores(job_tokens)[0]
    normalized = raw_score / (raw_score + 5) if raw_score > 0 else 0.0
    return round(float(normalized), 3)
