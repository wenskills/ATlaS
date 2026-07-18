"""Heatmap du CV: colore directement le document plutot que du texte retype.
"""
from __future__ import annotations

import base64

import fitz  # PyMuPDF
from sklearn.metrics.pairwise import cosine_similarity

from app.services.semantic_matching import get_model

ZOOM = 1.6
MIN_WORDS_FOR_ANALYSIS = 3
STRONG_THRESHOLD = 0.45
MEDIUM_THRESHOLD = 0.25
MAX_PAGES = 2


def _extract_lines_with_bbox(page, zoom: float) -> list[dict]:
    """Extrait chaque ligne de texte avec sa bounding box, mise a l'echelle
    du zoom utilise pour le rendu image (memes coordonnees que l'image PNG).
    """
    raw = page.get_text("dict")
    lines = []
    for block in raw.get("blocks", []):
        for line in block.get("lines", []):
            text = "".join(span.get("text", "") for span in line.get("spans", [])).strip()
            if not text:
                continue
            x0, y0, x1, y1 = line["bbox"]
            lines.append(
                {
                    "text": text,
                    "bbox": [x0 * zoom, y0 * zoom, x1 * zoom, y1 * zoom],
                }
            )
    return lines


def _level_for_score(score: float, word_count: int) -> str:
    if word_count < MIN_WORDS_FOR_ANALYSIS:
        return "neutral"
    if score >= STRONG_THRESHOLD:
        return "strong"
    if score >= MEDIUM_THRESHOLD:
        return "medium"
    return "weak"


def generate_heatmap(file_path: str, job_offer: str) -> dict:
    doc = fitz.open(file_path)
    model = get_model()
    job_embedding = model.encode([job_offer])[0]

    pages_payload = []

    for page_index in range(min(len(doc), MAX_PAGES)):
        page = doc[page_index]
        lines = _extract_lines_with_bbox(page, ZOOM)

        if lines:
            line_embeddings = model.encode([line["text"] for line in lines])
            similarities = cosine_similarity(line_embeddings, [job_embedding]).flatten()
        else:
            similarities = []

        scored_lines = []
        for line, score in zip(lines, similarities):
            word_count = len(line["text"].split())
            scored_lines.append(
                {
                    "bbox": line["bbox"],
                    "level": _level_for_score(float(score), word_count),
                    "score": round(float(score), 3),
                }
            )

        pix = page.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM))
        image_base64 = base64.b64encode(pix.tobytes("png")).decode("ascii")

        pages_payload.append(
            {
                "page_index": page_index,
                "image_base64": image_base64,
                "width": pix.width,
                "height": pix.height,
                "lines": scored_lines,
            }
        )

    doc.close()

    analyzed_lines = [
        line for page in pages_payload for line in page["lines"] if line["level"] != "neutral"
    ]
    strong_count = sum(1 for line in analyzed_lines if line["level"] == "strong")
    coverage = round(strong_count / len(analyzed_lines), 3) if analyzed_lines else 0.0

    return {
        "pages": pages_payload,
        "coverage_ratio": coverage,
        "total_lines_analyzed": len(analyzed_lines),
    }
