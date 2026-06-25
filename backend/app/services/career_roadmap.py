"""Generation du plan de carriere a 6 mois.

Contrairement a un roadmap generique base uniquement sur les competences
manquantes, ce module distingue explicitement deux categories d'ecarts:

- Les competences techniques (frameworks, outils, certifications): reellement
  comblables, avec une estimation de temps realiste.
- L'experience professionnelle (anciennete, niveau de responsabilite): non
  rattrapable artificiellement. Le plan propose des actions de compensation
  (projets concrets) plutot qu'une fausse promesse de delai.

Meme pipeline RAG que rag_advisor.py (retrieval + generation Gemini), avec
repli base sur des regles si aucune cle API n'est configuree.
"""
from __future__ import annotations

import json
import os
import time

from app.services.knowledge_base import retrieve

MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")


def _fallback_roadmap(missing_skills: list[str], kb_hits: list[dict], reason: str = "no_api_key") -> dict:
    skill_milestones = [
        {
            "skill": skill,
            "estimated_time": "2-4 semaines",
            "action": f"Pratiquer {skill} sur un projet personnel concret et l'ajouter explicitement au CV.",
        }
        for skill in missing_skills[:5]
    ]
    return {
        "source": "fallback_rules",
        "fallback_reason": reason,
        "summary": "Plan genere par regles, sans appel IA.",
        "skill_milestones": skill_milestones,
        "experience_note": (
            "L'experience professionnelle ne peut pas etre accumulee artificiellement. "
            "Compense par des projets personnels detailles avec le meme niveau de responsabilite."
        ),
        "timeline": [
            {
                "phase": "Mois 1-2",
                "title": "Combler les competences prioritaires",
                "description": "Se concentrer sur les 2-3 competences manquantes les plus citees dans l'offre.",
            },
            {
                "phase": "Mois 3-4",
                "title": "Construire une preuve concrete",
                "description": "Un projet personnel ou open-source qui demontre ces competences en contexte.",
            },
            {
                "phase": "Mois 5-6",
                "title": "Repositionner et relancer",
                "description": "Mettre a jour le CV avec ces preuves et re-analyser le score de couverture avant de postuler.",
            },
        ],
        "knowledge_base_used": [h["id"] for h in kb_hits],
    }


def generate_roadmap(job_offer: str, cv_text: str, analysis: dict) -> dict:
    missing_skills = analysis["skills"]["missing_skills"]
    kb_hits = retrieve(
        "estimation du temps pour combler une competence manquante, difference entre competence et experience",
        k=4,
    )

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return _fallback_roadmap(missing_skills, kb_hits, reason="no_api_key")

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("[career_roadmap] google-genai non installe. Lance: pip install -r requirements.txt")
        return _fallback_roadmap(missing_skills, kb_hits, reason="no_api_key")

    knowledge_context = "\n".join(f"- {hit['text']}" for hit in kb_hits)

    system_prompt = (
        "Tu es un conseiller carriere honnete. Tu recois une liste de competences manquantes "
        "detectees entre un CV et une offre, ainsi que des bonnes pratiques sur les delais "
        "d'apprentissage realistes. Tu dois generer un plan a 6 mois. "
        "REGLE CRITIQUE: distingue toujours les competences techniques isolees (rattrapables, "
        "avec une estimation de temps realiste et honnete, jamais optimiste) de l'experience "
        "professionnelle globale (anciennete, niveau de responsabilite), qui ne peut PAS etre "
        "accelere artificiellement - pour ce dernier point, propose une compensation par des "
        "projets concrets plutot qu'une fausse promesse de delai. "
        "Reponds UNIQUEMENT en JSON valide avec ce format exact: "
        '{"summary": str, '
        '"skill_milestones": [{"skill": str, "estimated_time": str, "action": str}], '
        '"experience_note": str, '
        '"timeline": [{"phase": str, "title": str, "description": str}]}'
    )

    user_prompt = f"""Offre d'emploi (extrait):
{job_offer[:1200]}

CV du candidat (extrait):
{cv_text[:1200]}

Competences manquantes detectees: {missing_skills}
Couverture actuelle des competences: {analysis['skills']['skill_coverage']}

Bonnes pratiques pertinentes:
{knowledge_context}

Genere le plan de carriere en JSON."""

    client = genai.Client(api_key=api_key)

    response = None
    last_error = None
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    max_output_tokens=8192,
                ),
            )
            break
        except Exception as exc:
            last_error = exc
            print(f"[career_roadmap] Tentative {attempt + 1}/3 echouee: {exc}")
            time.sleep(1.5 * (attempt + 1))

    if response is None:
        print(f"[career_roadmap] Appel Gemini definitivement echoue: {last_error}")
        return _fallback_roadmap(missing_skills, kb_hits, reason="api_overloaded")

    raw_text = (response.text or "").strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`").removeprefix("json").strip()

    try:
        roadmap = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        print(f"[career_roadmap] Reponse non parsable en JSON: {exc}")
        return _fallback_roadmap(missing_skills, kb_hits, reason="parse_error")

    roadmap["source"] = "gemini_api"
    roadmap["knowledge_base_used"] = [h["id"] for h in kb_hits]
    return roadmap
