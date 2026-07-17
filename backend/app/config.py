from __future__ import annotations

import os
import shutil
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

TEMP_DIR = Path(os.getenv("TEMP_DIR", "./tmp"))
TEMP_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", "25")) * 1024 * 1024

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")


def _find_libreoffice() -> str:
    env_val = os.getenv("LIBREOFFICE_PATH", "")
    if env_val and Path(env_val).exists():
        return env_val

    candidates = [
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        "/usr/bin/soffice",
        "/usr/local/bin/soffice",
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    ]
    for p in candidates:
        if Path(p).exists():
            return p

    found = shutil.which("soffice")
    if found:
        return found

    return "soffice"  # fallback — will raise a clear error at conversion time


LIBREOFFICE_PATH = _find_libreoffice()
