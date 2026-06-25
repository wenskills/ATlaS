"""Generation augmentee par recuperation (RAG): combine
(1) les scores/ecarts calcules par le pipeline de matching,
(2) les notices pertinentes recuperees dans la base de connaissances RH,
puis (3) appelle l'API Gemini (Google) pour generer un plan d'amelioration
structure et personnalise du CV.

Choix de Gemini plutot que Claude pour cette demo: l'API Gemini propose un
vrai palier gratuit (contrairement a l'API Claude, payante a l'usage des le
premier appel), ce qui permet de laisser la demo ouverte publiquement sans
generer de facturation. Si aucune cle API n'est configuree (GEMINI_API_KEY
absente), le module degrade proprement vers un plan base sur des regles
simples, pour que la demo reste fonctionnelle sans cle.
"""
from __future__ import annotations

import json
import os
import time

from app.services.knowledge_base import retrieve

MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")


def _build_retrieval_query(missing_skills: list[str], coverage: float) -> str:
    if missing_skills:
        return "competences manquantes: " + ", ".join(missing_skills)
    if coverage < 0.6:
        return "ameliorer la correspondance generale du cv avec l'offre"
    return "optimiser un cv deja bien aligne avec l'offre"


def _fallback_plan(analysis: dict, kb_hits: list[dict], reason: str = "no_api_key") -> dict:
    """Plan degrade sans appel LLM, base sur des regles deterministes.

    `reason` distingue pourquoi on degrade (cle absente, Gemini surcharge,
    reponse non parsable) afin que le frontend affiche un message honnete
    plutot qu'un message generique identique dans tous les cas.
    """
    actions = []
    missing = analysis["skills"]["missing_skills"]
    if missing:
        actions.append(
            {
                "priority": "haute",
                "action": "Ajouter les compétences manquantes détectées",
                "details": f"Intégrer explicitement : {', '.join(missing[:6])} dans la section compétences ou une expérience pertinente.",
            }
        )
    if analysis["scores"]["breakdown"]["parseability"] < 0.7:
        actions.append(
            {
                "priority": "haute",
                "action": "Clarifier la structure du CV",
                "details": "Ajouter des titres de section standards (Expérience, Formation, Compétences) pour faciliter le parsing automatique.",
            }
        )
    if analysis["scores"]["breakdown"]["lexical_score"] < analysis["scores"]["breakdown"]["semantic_score"] - 0.15:
        actions.append(
            {
                "priority": "moyenne",
                "action": "Aligner le vocabulaire sur l'offre",
                "details": "Le contenu est pertinent sur le fond mais le vocabulaire exact de l'offre est peu repris. Reprendre les intitulés précis des outils/compétences cités.",
            }
        )
    if not actions:
        actions.append(
            {
                "priority": "basse",
                "action": "CV déjà bien aligné",
                "details": "Continuer à quantifier les réalisations (chiffres, impact) pour renforcer encore le contenu.",
            }
        )
    return {
        "source": "fallback_rules",
        "fallback_reason": reason,
        "summary": "Plan généré par règles, sans appel IA.",
        "actions": actions,
        "knowledge_base_used": [h["id"] for h in kb_hits],
        "rewritten_bullet_example": None,
    }


def generate_improvement_plan(job_offer: str, cv_text: str, analysis: dict) -> dict:
    missing_skills = analysis["skills"]["missing_skills"]
    coverage = analysis["skills"]["skill_coverage"]

    query = _build_retrieval_query(missing_skills, coverage)
    kb_hits = retrieve(query, k=4)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return _fallback_plan(analysis, kb_hits, reason="no_api_key")

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print(
            "[rag_advisor] GEMINI_API_KEY est definie mais le paquet "
            "google-genai n'est pas installe. Lance: pip install -r requirements.txt"
        )
        return _fallback_plan(analysis, kb_hits, reason="no_api_key")

    knowledge_context = "\n".join(f"- {hit['text']}" for hit in kb_hits)

    system_prompt = (
        "Tu es un conseiller carriere specialise dans l'optimisation de CV pour les ATS. "
        "Tu recois des donnees calculees (scores, competences manquantes) et des bonnes pratiques RH. "
        "Reponds UNIQUEMENT en JSON valide, sans texte autour, avec ce format exact: "
        '{"summary": str, "actions": [{"priority": "haute|moyenne|basse", "action": str, "details": str}], '
        '"rewritten_bullet_example": str}. '
        "Les actions doivent etre concretes, basees sur les ecarts reels fournis, pas generiques."
    )

    user_prompt = f"""Offre d'emploi (extrait):
{job_offer[:1500]}

CV du candidat (extrait):
{cv_text[:1500]}

Scores calcules:
- Score global: {analysis['scores']['global_score']}
- Couverture competences: {coverage}
- Competences manquantes: {missing_skills}
- Competences detectees dans le CV: {analysis['skills']['cv_skills_detected']}

Bonnes pratiques RH pertinentes (base de connaissances):
{knowledge_context}

Genere le plan d'amelioration JSON."""

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
            # Erreurs transitoires (surcharge cote Google, quota momentane):
            # on retente avec un court delai avant d'abandonner. Une erreur
            # definitive (cle invalide, etc.) echouera de la meme facon a
            # chaque tentative, donc le cout des retries reste minime.
            print(f"[rag_advisor] Tentative {attempt + 1}/3 echouee: {exc}")
            time.sleep(1.5 * (attempt + 1))

    if response is None:
        print(f"[rag_advisor] Appel a l'API Gemini definitivement echoue: {last_error}")
        return _fallback_plan(analysis, kb_hits, reason="api_overloaded")

    raw_text = (response.text or "").strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        raw_text = raw_text.removeprefix("json").strip()

    try:
        plan = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        print(f"[rag_advisor] Reponse Gemini non parsable en JSON: {exc}")
        return _fallback_plan(analysis, kb_hits, reason="parse_error")

    plan["source"] = "gemini_api"
    plan["knowledge_base_used"] = [h["id"] for h in kb_hits]
    return plan
