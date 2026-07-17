from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from app.config import TEMP_DIR


def tmp_path(suffix: str) -> Path:
    """Return a unique temp file path inside TEMP_DIR."""
    return TEMP_DIR / f"{uuid4().hex}{suffix}"


def unlink_quiet(*paths: Path) -> None:
    """Delete files silently — used in BackgroundTasks."""
    for p in paths:
        try:
            p.unlink(missing_ok=True)
        except OSError:
            pass  # APScheduler cleanup job handles stragglers
