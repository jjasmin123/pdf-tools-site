from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from uuid import uuid4

MAX_DOWNLOADS = 2
EXPIRY_SECONDS = 600  # 10 minutes


@dataclass
class DownloadEntry:
    path: Path
    filename: str
    mime: str
    size: int
    created_at: float = field(default_factory=time.time)
    downloads: int = 0
    max_downloads: int = MAX_DOWNLOADS


class DownloadManager:
    def __init__(self) -> None:
        self._store: dict[str, DownloadEntry] = {}
        self._lock = threading.Lock()

    def register(self, path: Path, filename: str, mime: str) -> str:
        file_id = uuid4().hex
        size = path.stat().st_size if path.exists() else 0
        with self._lock:
            self._store[file_id] = DownloadEntry(
                path=path, filename=filename, mime=mime, size=size
            )
        return file_id

    def consume(self, file_id: str) -> tuple[DownloadEntry | None, int]:
        """Returns (entry, downloads_remaining_after_this_one). Removes from store when exhausted."""
        with self._lock:
            entry = self._store.get(file_id)
            if not entry:
                return None, 0
            entry.downloads += 1
            remaining = entry.max_downloads - entry.downloads
            if remaining <= 0:
                del self._store[file_id]
            return entry, max(remaining, 0)

    def cleanup_expired(self, max_age: int = EXPIRY_SECONDS) -> int:
        now = time.time()
        to_delete: list[Path] = []
        with self._lock:
            for fid, entry in list(self._store.items()):
                if now - entry.created_at > max_age:
                    to_delete.append(entry.path)
                    del self._store[fid]
        for path in to_delete:
            path.unlink(missing_ok=True)
        return len(to_delete)


download_manager = DownloadManager()
