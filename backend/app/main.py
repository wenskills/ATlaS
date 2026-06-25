import os
import uuid

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, MAX_UPLOAD_SIZE_MB, UPLOAD_DIR
from app.services import career_roadmap, cover_letter, rag_advisor, scoring, skills_extractor
from app.services.lexical_matching import bm25_score, tfidf_score
from app.services.pdf_extractor import (
    detect_sections,
    extract_pdf_text,
    has_contact_email,
    has_contact_phone,
)
from app.services.pdf_heatmap import generate_heatmap
from app.services.semantic_matching import sbert_score, sentence_level_gaps

app = FastAPI(
    title="ATlaS API",
    description="Moteur de matching CV/offre inspire des ATS RH, avec conseiller IA base sur du RAG.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/health")
async def health():
    return {"status": "ok"}


def _save_upload(cv_file: UploadFile, content: bytes) -> str:
    safe_name = f"{uuid.uuid4().hex}_{os.path.basename(cv_file.filename or 'cv.pdf')}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        f.write(content)
    return file_path


async def _read_and_validate(cv_file: UploadFile) -> bytes:
    if cv_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Le fichier doit etre un PDF.")
    content = await cv_file.read()
    if len(content) > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Fichier trop volumineux (max {MAX_UPLOAD_SIZE_MB} Mo).")
    return content


def _run_analysis(job_offer: str, cv_text: str) -> dict:
    lexical = max(tfidf_score(job_offer, cv_text), bm25_score(job_offer, cv_text))
    semantic = sbert_score(job_offer, cv_text)

    sections = detect_sections(cv_text)
    parseability = scoring.parseability_score(
        sections, has_contact_email(cv_text), has_contact_phone(cv_text)
    )

    skill_gap = skills_extractor.extract_skill_gap(job_offer, cv_text)

    composite = scoring.composite_score(
        skill_coverage=skill_gap["skill_coverage"],
        lexical_score=lexical,
        semantic_score=semantic,
        parseability=parseability,
    )
    composite["label"] = scoring.label_for_score(composite["global_score"])

    gaps = sentence_level_gaps(job_offer, cv_text)

    return {
        "scores": composite,
        "skills": skill_gap,
        "sections_detected": sections,
        "weakest_sentence_gaps": gaps[:5],
        "cv_text_preview": cv_text[:1000],
    }


@app.post("/api/match")
async def match_cv(job_offer: str = Form(...), cv_file: UploadFile = File(...)):
    """Analyse complete: scores composites, competences manquantes,
    parseabilite, et phrases de l'offre les moins couvertes par le CV.
    """
    content = await _read_and_validate(cv_file)
    file_path = _save_upload(cv_file, content)
    cv_text = extract_pdf_text(file_path)

    if not cv_text.strip():
        raise HTTPException(status_code=422, detail="Impossible d'extraire du texte de ce PDF.")

    return _run_analysis(job_offer, cv_text)


@app.post("/api/advisor")
async def advisor(job_offer: str = Form(...), cv_file: UploadFile = File(...)):
    """Pipeline complet RAG: relance l'analyse puis genere un plan
    d'amelioration personnalise via la base de connaissances + l'API Gemini.
    """
    content = await _read_and_validate(cv_file)
    file_path = _save_upload(cv_file, content)
    cv_text = extract_pdf_text(file_path)

    if not cv_text.strip():
        raise HTTPException(status_code=422, detail="Impossible d'extraire du texte de ce PDF.")

    analysis = _run_analysis(job_offer, cv_text)
    plan = rag_advisor.generate_improvement_plan(job_offer, cv_text, analysis)

    return {"analysis": analysis, "improvement_plan": plan}


@app.post("/api/heatmap")
async def heatmap(job_offer: str = Form(...), cv_file: UploadFile = File(...)):
    """Heatmap superposee directement sur le rendu image du PDF: chaque ligne
    du document est colore selon sa pertinence semantique par rapport a
    l'offre, avec les coordonnees exactes pour le positionnement frontend.
    """
    content = await _read_and_validate(cv_file)
    file_path = _save_upload(cv_file, content)

    try:
        result = generate_heatmap(file_path, job_offer)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Impossible de generer la heatmap: {exc}")

    return result


@app.post("/api/cover-letter")
async def cover_letter_endpoint(
    job_offer: str = Form(...),
    cv_file: UploadFile = File(...),
    tone: str = Form("dynamique"),
):
    """Genere une lettre de motivation prete a l'emploi (aucune mention d'IA
    dans le contenu retourne) basee sur l'offre et le CV.
    """
    content = await _read_and_validate(cv_file)
    file_path = _save_upload(cv_file, content)
    cv_text = extract_pdf_text(file_path)

    if not cv_text.strip():
        raise HTTPException(status_code=422, detail="Impossible d'extraire du texte de ce PDF.")

    return cover_letter.generate_cover_letter(job_offer, cv_text, tone)


@app.post("/api/roadmap")
async def roadmap(job_offer: str = Form(...), cv_file: UploadFile = File(...)):
    """Plan de carriere a 6 mois, en distinguant honnetement les competences
    rattrapables (avec estimation de temps) de l'experience non rattrapable.
    """
    content = await _read_and_validate(cv_file)
    file_path = _save_upload(cv_file, content)
    cv_text = extract_pdf_text(file_path)

    if not cv_text.strip():
        raise HTTPException(status_code=422, detail="Impossible d'extraire du texte de ce PDF.")

    analysis = _run_analysis(job_offer, cv_text)
    return career_roadmap.generate_roadmap(job_offer, cv_text, analysis)
