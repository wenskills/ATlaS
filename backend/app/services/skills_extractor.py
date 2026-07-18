"""Extraction de competences par correspondance contre une taxonomie.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from app.services.preprocessing import preprocess

_TAXONOMY_PATH = Path(__file__).resolve().parent.parent / "data" / "skills_taxonomy.json"

with open(_TAXONOMY_PATH, encoding="utf-8") as f:
    _TAXONOMY: dict[str, list[str]] = json.load(f)

_ALL_SKILLS: list[str] = sorted({s for skills in _TAXONOMY.values() for s in skills})

_SKILL_PATTERNS = {
    skill: re.compile(r"\b" + re.escape(preprocess(skill)) + r"\b")
    for skill in _ALL_SKILLS
}


def _find_skills(text: str) -> set[str]:
    clean = preprocess(text)
    return {skill for skill, pattern in _SKILL_PATTERNS.items() if pattern.search(clean)}


def extract_skill_gap(job_offer: str, cv_text: str) -> dict:
    job_skills = _find_skills(job_offer)
    cv_skills = _find_skills(cv_text)

    matched = sorted(job_skills & cv_skills)
    missing = sorted(job_skills - cv_skills)
    extra = sorted(cv_skills - job_skills)

    coverage = round(len(matched) / len(job_skills), 3) if job_skills else 1.0

    return {
        "job_skills_detected": sorted(job_skills),
        "cv_skills_detected": sorted(cv_skills),
        "matched_skills": matched,
        "missing_skills": missing,
        "extra_skills": extra,
        "skill_coverage": coverage,
    }
