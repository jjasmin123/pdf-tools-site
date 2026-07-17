"""Tests for configuration defaults and environment overrides."""

from __future__ import annotations

import importlib
from pathlib import Path


def test_default_max_file_size():
    from app.config import MAX_FILE_SIZE_BYTES

    assert MAX_FILE_SIZE_BYTES == 25 * 1024 * 1024


def test_temp_dir_is_a_path():
    from app.config import TEMP_DIR

    assert isinstance(TEMP_DIR, Path)


def test_allowed_origins_is_a_list():
    from app.config import ALLOWED_ORIGINS

    assert isinstance(ALLOWED_ORIGINS, list)
    assert len(ALLOWED_ORIGINS) >= 1


def test_env_override_max_size(monkeypatch):
    monkeypatch.setenv("MAX_FILE_SIZE_MB", "10")
    import app.config as cfg

    importlib.reload(cfg)
    assert cfg.MAX_FILE_SIZE_BYTES == 10 * 1024 * 1024
    # restore
    monkeypatch.delenv("MAX_FILE_SIZE_MB", raising=False)
    importlib.reload(cfg)
