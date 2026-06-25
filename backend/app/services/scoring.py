"""Score composite pondere, inspire de la maniere dont les ATS reels
combinent plusieurs signaux (et pas un score unique): correspondance de
competences, score lexical, score semantique, et qualite de parsing.

Les poids sont volontairement configurables: un recruteur tech pondere
davantage les competences techniques exactes, un recruteur RH generaliste
pondere davantage le semantique/l'experience globale.
"""
from __future__ import annotations

DEFAULT_WEIGHTS = {
    "skill_coverage": 0.40,
    "lexical": 0.20,
    "semantic": 0.25,
    "parseability": 0.15,
}


def parseability_score(sections: dict[str, bool], has_email: bool, has_phone: bool) -> float:
    """Approxime la capacite d'un ATS a correctement parser le CV: presence
    des sections standards + coordonnees detectables. Ne capture pas les
    problemes de mise en page visuelle (colonnes, images) puisqu'on travaille
    sur du texte deja extrait, mais capture les signaux structurels.
    """
    section_score = sum(sections.values()) / len(sections) if sections else 0.0
    contact_score = (int(has_email) + int(has_phone)) / 2
    return round(0.7 * section_score + 0.3 * contact_score, 3)


def composite_score(
    skill_coverage: float,
    lexical_score: float,
    semantic_score: float,
    parseability: float,
    weights: dict[str, float] | None = None,
) -> dict:
    w = weights or DEFAULT_WEIGHTS
    total = (
        skill_coverage * w["skill_coverage"]
        + lexical_score * w["lexical"]
        + semantic_score * w["semantic"]
        + parseability * w["parseability"]
    )
    return {
        "global_score": round(total, 3),
        "breakdown": {
            "skill_coverage": skill_coverage,
            "lexical_score": lexical_score,
            "semantic_score": semantic_score,
            "parseability": parseability,
        },
        "weights": w,
    }


def label_for_score(score: float) -> str:
    if score >= 0.75:
        return "Très forte correspondance"
    if score >= 0.55:
        return "Bonne correspondance"
    if score >= 0.35:
        return "Correspondance moyenne"
    return "Faible correspondance"
