from __future__ import annotations

import logging
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.services.libreoffice import convert_to_pdf
from app.utils.download_manager import MAX_DOWNLOADS, EXPIRY_SECONDS, download_manager
from app.utils.file_validation import validate_file, validate_size
from app.utils.tempfiles import tmp_path, unlink_quiet

router = APIRouter(prefix="/api/excel", tags=["Excel Tools"])
logger = logging.getLogger(__name__)

_PDF_MIME = "application/pdf"


def _ready(file_id: str, filename: str, size: int) -> dict:
    return {
        "file_id": file_id,
        "filename": filename,
        "size": size,
        "downloads_remaining": MAX_DOWNLOADS,
        "expires_in": EXPIRY_SECONDS,
    }


@router.get("/health")
async def excel_health():
    return {"status": "ok", "router": "excel_tools"}


@router.post("/to-pdf")
async def excel_to_pdf(file: UploadFile = File(...)):
    validate_file(file, "excel")
    data = await validate_size(file)

    suffix = Path(file.filename or "spreadsheet.xlsx").suffix or ".xlsx"
    src = tmp_path(suffix)
    src.write_bytes(data)

    try:
        out = await convert_to_pdf(src, src.parent)
    except RuntimeError as e:
        unlink_quiet(src)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "spreadsheet").stem
    filename = f"{stem}.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)
