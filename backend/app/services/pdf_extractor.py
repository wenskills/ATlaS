"""Extraction de texte depuis un PDF, avec une detection naive des sections
du CV (Experience, Formation, Competences...) utilisee pour le score de
parseabilite ATS.
"""
from __future__ import annotations

import re

from pypdf import PdfReader

SECTION_PATTERNS = {
    "experience": r"exp[ée]rience|experiences? professionnelles?|parcours professionnel",
    "formation": r"formations?|[ée]ducation|dipl[ôo]mes?|cursus",
    "competences": r"comp[ée]tences?|skills?|stack technique",
    "projets": r"projets?|projects?|r[ée]alisations?",
    "contact": r"contact|coordonn[ée]es?",
}


def extract_pdf_text(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
        text += "\n"
    return text


def detect_sections(raw_text: str) -> dict[str, bool]:
    """Renvoie quelles sections standards sont detectables dans le texte brut.
    Sert de proxy simple pour la "parseabilite ATS" du document.
    """
    lower = raw_text.lower()
    return {
        section: bool(re.search(pattern, lower))
        for section, pattern in SECTION_PATTERNS.items()
    }


def has_contact_email(raw_text: str) -> bool:
    return bool(re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", raw_text))


def has_contact_phone(raw_text: str) -> bool:
    return bool(re.search(r"(?:\+33|0)[\s.-]?[1-9](?:[\s.-]?\d{2}){4}", raw_text))
