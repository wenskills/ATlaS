"""Matching semantique base sur Sentence-BERT.

En plus du score global (deja present dans la v1 du POC), ce module ajoute
une decomposition phrase par phrase: pour chaque phrase de l'offre, on
identifie la phrase du CV la plus proche semantiquement. C'est cette
decomposition qui alimente ensuite le conseiller IA (quelles phrases de
l'offre ne trouvent aucun echo fort dans le CV).
"""
from __future__ import annotations

import re

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def split_sentences(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?\n])\s+", text)
    return [s.strip() for s in sentences if _is_usable_sentence(s.strip())]


def _is_usable_sentence(sentence: str) -> bool:
    """Filtre les phrases trop courtes ou corrompues par l'extraction PDF.

    Les CV qui presentent leurs competences via des icones/logos plutot que
    du texte produisent souvent des fragments du type "en , , , et ." une
    fois le PDF extrait en texte brut: la structure de la phrase survit mais
    le contenu entre les virgules a disparu. On detecte ce cas via le ratio
    de caracteres alphabetiques et la presence de virgules consecutives non
    separees par un mot.
    """
    if len(sentence) <= 8:
        return False
    if re.search(r",\s*,", sentence):
        return False
    letters = sum(c.isalpha() for c in sentence)
    if letters / max(len(sentence), 1) < 0.4:
        return False
    return True


def sbert_score(job_offer: str, cv_text: str) -> float:
    model = get_model()
    embeddings = model.encode([job_offer, cv_text])
    score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return round(float(score), 3)


def sentence_level_gaps(job_offer: str, cv_text: str, threshold: float = 0.35) -> list[dict]:
    """Pour chaque phrase de l'offre, renvoie la meilleure phrase du CV qui
    y correspond et le score associe. En dessous d'un second seuil plus bas
    (no_match_threshold), aucune phrase du CV n'est assez proche pour
    constituer une correspondance credible: on le signale explicitement
    plutot que d'afficher un "meilleur match" trompeur.
    """
    model = get_model()
    job_sentences = split_sentences(job_offer)
    cv_sentences = split_sentences(cv_text)

    if not job_sentences or not cv_sentences:
        return []

    job_emb = model.encode(job_sentences)
    cv_emb = model.encode(cv_sentences)
    sim_matrix = cosine_similarity(job_emb, cv_emb)

    no_match_threshold = 0.2
    results = []
    for i, sentence in enumerate(job_sentences):
        best_idx = int(sim_matrix[i].argmax())
        best_score = float(sim_matrix[i][best_idx])
        has_match = best_score >= no_match_threshold
        results.append(
            {
                "job_sentence": sentence,
                "best_cv_match": cv_sentences[best_idx] if has_match else None,
                "score": round(best_score, 3),
                "covered": best_score >= threshold,
                "has_match": has_match,
            }
        )
    return sorted(results, key=lambda r: r["score"])
