from __future__ import annotations

import logging
import time

from apscheduler.schedulers.background import BackgroundScheduler

from app.config import TEMP_DIR
from app.utils.download_manager import download_manager

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def delete_old_temp_files(max_age_seconds: int = 3600) -> None:
    now = time.time()
    for f in TEMP_DIR.iterdir():
        if f.is_file() and (now - f.stat().st_mtime) > max_age_seconds:
            try:
                f.unlink()
                logger.info("Cleaned up stale temp file: %s", f.name)
            except OSError as e:
                logger.warning("Could not delete %s: %s", f.name, e)


def _run_all_cleanups() -> None:
    delete_old_temp_files()
    removed = download_manager.cleanup_expired()
    if removed:
        logger.info("Expired %d download entries from DownloadManager.", removed)


def start_cleanup_scheduler() -> None:
    global _scheduler
    _scheduler = BackgroundScheduler()
    _scheduler.add_job(_run_all_cleanups, "interval", minutes=15)
    _scheduler.start()
    logger.info("Cleanup scheduler started (runs every 15 min).")


def stop_cleanup_scheduler() -> None:
    if _scheduler:
        _scheduler.shutdown(wait=False)
