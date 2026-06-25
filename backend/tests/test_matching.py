from app.services import scoring, skills_extractor
from app.services.lexical_matching import bm25_score, tfidf_score
from app.services.pdf_extractor import detect_sections, has_contact_email
from app.services.preprocessing import preprocess, tokenize

JOB_OFFER = "Nous recherchons un developpeur Python avec experience Django et PostgreSQL pour rejoindre notre equipe agile."
CV_GOOD = "Developpeur full-stack avec 2 ans d'experience en Python, Django, PostgreSQL et methodologie agile/scrum."
CV_UNRELATED = "Cuisinier passionne avec 5 ans d'experience en patisserie et gestion de stock."


def test_preprocess_lowercases_and_strips_accents():
    assert preprocess("Développeur Énergique!") == "developpeur energique"


def test_tokenize_returns_word_list():
    assert tokenize("Python et Django") == ["python", "et", "django"]


def test_tfidf_score_higher_for_relevant_cv():
    relevant = tfidf_score(JOB_OFFER, CV_GOOD)
    irrelevant = tfidf_score(JOB_OFFER, CV_UNRELATED)
    assert relevant > irrelevant


def test_bm25_score_higher_for_relevant_cv():
    relevant = bm25_score(JOB_OFFER, CV_GOOD)
    irrelevant = bm25_score(JOB_OFFER, CV_UNRELATED)
    assert relevant > irrelevant


def test_skill_gap_detects_matched_and_missing():
    gap = skills_extractor.extract_skill_gap(JOB_OFFER, CV_GOOD)
    assert "python" in gap["matched_skills"]
    assert "django" in gap["matched_skills"]
    assert gap["skill_coverage"] == 1.0


def test_skill_gap_flags_missing_skill():
    cv_missing_django = "Developpeur Python avec PostgreSQL, pas d'experience Django."
    gap = skills_extractor.extract_skill_gap(JOB_OFFER, cv_missing_django)
    assert "django" in gap["missing_skills"]


def test_detect_sections_finds_standard_headers():
    text = "EXPERIENCE PROFESSIONNELLE\nDev chez X\nFORMATION\nMaster Info\nCOMPETENCES\nPython"
    sections = detect_sections(text)
    assert sections["experience"] is True
    assert sections["formation"] is True
    assert sections["competences"] is True


def test_has_contact_email_detects_valid_email():
    assert has_contact_email("Me contacter: wendy.test@example.com") is True
    assert has_contact_email("Aucune coordonnee ici") is False


def test_composite_score_is_weighted_average():
    result = scoring.composite_score(
        skill_coverage=1.0, lexical_score=1.0, semantic_score=1.0, parseability=1.0
    )
    assert result["global_score"] == 1.0


def test_label_for_score_thresholds():
    assert scoring.label_for_score(0.9) == "Tres forte correspondance"
    assert scoring.label_for_score(0.1) == "Faible correspondance"
