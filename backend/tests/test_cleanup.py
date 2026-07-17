"""Unit tests for the temp-file cleanup utility."""

from __future__ import annotations

import time
from pathlib import Path

from app.utils.cleanup import delete_old_temp_files


def test_deletes_files_older_than_max_age(tmp_path: Path):
    old = tmp_path / "old.pdf"
    old.write_bytes(b"old")
    # Back-date modification time by 2 hours
    old_mtime = time.time() - 7200
    import os

    os.utime(old, (old_mtime, old_mtime))

    # Temporarily point TEMP_DIR at tmp_path
    import app.utils.cleanup as cleanup_mod

    original = cleanup_mod.TEMP_DIR
    cleanup_mod.TEMP_DIR = tmp_path
    try:
        delete_old_temp_files(max_age_seconds=3600)
    finally:
        cleanup_mod.TEMP_DIR = original

    assert not old.exists(), "Old file should have been deleted"


def test_keeps_recent_files(tmp_path: Path):
    recent = tmp_path / "recent.pdf"
    recent.write_bytes(b"recent")

    import app.utils.cleanup as cleanup_mod

    original = cleanup_mod.TEMP_DIR
    cleanup_mod.TEMP_DIR = tmp_path
    try:
        delete_old_temp_files(max_age_seconds=3600)
    finally:
        cleanup_mod.TEMP_DIR = original

    assert recent.exists(), "Recent file should NOT have been deleted"


def test_empty_temp_dir_does_not_raise(tmp_path: Path):
    import app.utils.cleanup as cleanup_mod

    original = cleanup_mod.TEMP_DIR
    cleanup_mod.TEMP_DIR = tmp_path
    try:
        delete_old_temp_files()  # should not raise
    finally:
        cleanup_mod.TEMP_DIR = original
