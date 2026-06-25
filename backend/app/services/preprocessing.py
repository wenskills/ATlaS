import re
import unicodedata


def strip_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(c for c in normalized if not unicodedata.combining(c))


def preprocess(text: str) -> str:
    """Nettoyage simple: minuscules, suppression accents pour le matching
    lexical, suppression de la ponctuation, espaces normalises.
    """
    text = text.lower()
    text = strip_accents(text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str) -> list[str]:
    return preprocess(text).split()
