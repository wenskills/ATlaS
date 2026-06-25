"""Generation de lettre de motivation.

Contrairement au conseiller IA (section RAG visible dans l'app), la lettre
generee ne doit jamais mentionner qu'elle a ete ecrite par une IA: c'est un
document que la personne va reellement envoyer a un recruteur. La
transparence sur l'usage de l'IA reste dans l'interface (tag visible dans
l'app), jamais dans le contenu exporte.
"""
from __future__ import annotations

import os
import time

TONE_INSTRUCTIONS = {
    "formel": "Registre soutenu et classique, phrases longues et structurees.",
    "dynamique": "Registre energique et direct, phrases courtes, enthousiasme visible.",
    "concis": "Le plus court possible (120-150 mots), une idee forte par phrase.",
}

MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")


def _fallback_letter(tone: str) -> str:
    return (
        "Madame, Monsieur,\n\n"
        "Je vous adresse ma candidature avec grand interet pour ce poste. Mon parcours et mes "
        "competences techniques correspondent aux exigences de l'offre, et je serais ravi(e) "
        "de vous en exposer le detail lors d'un entretien.\n\n"
        "Je vous remercie de l'attention portee a ma candidature.\n\n"
        "Cordialement,"
        f"\n\n[Lettre generique - mode degrade, ton demande: {tone}. "
        "Configure GEMINI_API_KEY pour une lettre personnalisee.]"
    )


def generate_cover_letter(job_offer: str, cv_text: str, tone: str = "dynamique") -> dict:
    tone = tone if tone in TONE_INSTRUCTIONS else "dynamique"

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"letter_text": _fallback_letter(tone), "source": "fallback_rules", "fallback_reason": "no_api_key", "tone": tone}

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("[cover_letter] google-genai non installe.")
        return {"letter_text": _fallback_letter(tone), "source": "fallback_rules", "fallback_reason": "no_api_key", "tone": tone}

    system_prompt = (
        "Tu rediges une lettre de motivation en francais, prete a etre envoyee telle quelle par "
        "le candidat a un recruteur. "
        f"Ton demande: {TONE_INSTRUCTIONS[tone]} "
        "REGLE ABSOLUE: ne mentionne JAMAIS, sous aucune forme, qu'une IA, un outil, un logiciel "
        "ou un algorithme a participe a la redaction. Le texte doit se lire comme ecrit "
        "directement par le candidat. N'invente aucune experience, certification ou diplome qui "
        "n'apparait pas dans le CV fourni. Ne mets aucun texte d'introduction ou de meta-commentaire, "
        "renvoie uniquement le corps de la lettre."
    )

    user_prompt = f"""Offre d'emploi:
{job_offer[:1500]}

CV du candidat:
{cv_text[:1500]}

Redige la lettre de motivation."""

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
                    max_output_tokens=4096,
                ),
            )
            break
        except Exception as exc:
            last_error = exc
            print(f"[cover_letter] Tentative {attempt + 1}/3 echouee: {exc}")
            time.sleep(1.5 * (attempt + 1))

    if response is None:
        print(f"[cover_letter] Appel Gemini definitivement echoue: {last_error}")
        return {"letter_text": _fallback_letter(tone), "source": "fallback_rules", "fallback_reason": "api_overloaded", "tone": tone}

    letter_text = (response.text or "").strip()
    if not letter_text:
        return {"letter_text": _fallback_letter(tone), "source": "fallback_rules", "fallback_reason": "parse_error", "tone": tone}

    return {"letter_text": letter_text, "source": "gemini_api", "tone": tone}
