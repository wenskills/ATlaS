import os
from pathlib import Path

from dotenv import load_dotenv

# Chemin explicite vers backend/.env, independant du repertoire depuis lequel
# uvicorn est lance (load_dotenv() sans argument peut chercher au mauvais
# endroit selon le contexte d'execution).
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
MAX_UPLOAD_SIZE_MB = int(os.environ.get("MAX_UPLOAD_SIZE_MB", "5"))
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
