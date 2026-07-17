from __future__ import annotations

import json
import logging
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.services.pdf_service import (
    add_page_numbers,
    compress_pdf,
    crop_pdf,
    get_pdf_info,
    pdf_to_excel,
    pdf_to_markdown,
    pdf_to_pptx,
    pdf_to_word,
    protect_pdf,
    reorder_pdf,
    repair_pdf,
    rotate_pdf,
    unlock_pdf,
    watermark_pdf,
)
from app.utils.download_manager import MAX_DOWNLOADS, EXPIRY_SECONDS, download_manager
from app.utils.file_validation import validate_file, validate_size
from app.utils.tempfiles import tmp_path, unlink_quiet

router = APIRouter(prefix="/api/pdf", tags=["PDF Tools"])
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
async def pdf_health():
    return {"status": "ok", "router": "pdf_tools"}


@router.get("/download/{file_id}")
async def download_file(file_id: str, background_tasks: BackgroundTasks):
    entry, remaining = download_manager.consume(file_id)
    if not entry:
        raise HTTPException(
            status_code=404,
            detail="File not found or download limit reached. Please convert your file again.",
        )
    if not entry.path.exists():
        raise HTTPException(status_code=410, detail="File has expired and been deleted.")
    if remaining == 0:
        background_tasks.add_task(unlink_quiet, entry.path)
    return FileResponse(
        entry.path,
        media_type=entry.mime,
        filename=entry.filename,
        headers={"X-Downloads-Remaining": str(remaining)},
    )


@router.post("/compress")
async def compress_pdf_endpoint(
    file: UploadFile = File(...),
    level: str = Form("balanced"),
):
    if level not in ("light", "balanced", "maximum"):
        level = "balanced"
    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".pdf")
    src.write_bytes(data)

    try:
        await compress_pdf(src, out, level=level)
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        unlink_quiet(src)

    if out.stat().st_size >= len(data):
        unlink_quiet(out)
        raise HTTPException(
            status_code=422,
            detail="This PDF is already fully compressed — no further reduction is possible.",
        )

    stem = Path(file.filename or "document").stem
    filename = f"{stem}_compressed.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/info")
async def pdf_info_endpoint(file: UploadFile = File(...)):
    validate_file(file, "pdf")
    data = await validate_size(file)
    src = tmp_path(".pdf")
    src.write_bytes(data)
    try:
        info = await get_pdf_info(src)
    except Exception as e:
        unlink_quiet(src)
        raise HTTPException(status_code=500, detail=str(e))
    unlink_quiet(src)
    return info


@router.post("/rotate")
async def rotate_pdf_endpoint(
    file: UploadFile = File(...),
    rotation: int = Form(90),
    pages: str = Form("all"),
):
    if rotation not in (90, 180, 270):
        rotation = 90
    validate_file(file, "pdf")
    data = await validate_size(file)

    page_list: list[int] | None = None
    if pages.strip() != "all":
        try:
            page_list = [int(p.strip()) - 1 for p in pages.split(",") if p.strip().isdigit()]
        except Exception:
            page_list = None

    src = tmp_path(".pdf")
    out = tmp_path(".pdf")
    src.write_bytes(data)
    try:
        await rotate_pdf(src, out, rotation, page_list)
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}_rotated.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/reorder")
async def reorder_pdf_endpoint(
    file: UploadFile = File(...),
    order: str = Form(...),
):
    validate_file(file, "pdf")
    data = await validate_size(file)

    try:
        order_list: list[int] = json.loads(order)
        if not isinstance(order_list, list) or not all(isinstance(i, int) for i in order_list):
            raise ValueError
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid page order — must be a JSON array of integers.")

    src = tmp_path(".pdf")
    out = tmp_path(".pdf")
    src.write_bytes(data)
    try:
        await reorder_pdf(src, out, order_list)
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}_reordered.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/watermark")
async def watermark_pdf_endpoint(
    file: UploadFile = File(...),
    text: str = Form(...),
    opacity: float = Form(0.3),
    color: str = Form("#808080"),
):
    if not text.strip():
        raise HTTPException(status_code=422, detail="Watermark text cannot be empty.")
    validate_file(file, "pdf")
    data = await validate_size(file)

    hex_color = color.lstrip("#")
    try:
        r = int(hex_color[0:2], 16) / 255
        g = int(hex_color[2:4], 16) / 255
        b = int(hex_color[4:6], 16) / 255
    except Exception:
        r, g, b = 0.5, 0.5, 0.5

    opacity = max(0.05, min(1.0, opacity))

    src = tmp_path(".pdf")
    out = tmp_path(".pdf")
    src.write_bytes(data)
    try:
        await watermark_pdf(src, out, text.strip(), opacity, (r, g, b))
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}_watermarked.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/protect")
async def protect_pdf_endpoint(
    file: UploadFile = File(...),
    password: str = Form(...),
):
    if not password:
        raise HTTPException(status_code=422, detail="Password cannot be empty.")
    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".pdf")
    src.write_bytes(data)
    try:
        await protect_pdf(src, out, password)
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}_protected.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/unlock")
async def unlock_pdf_endpoint(
    file: UploadFile = File(...),
    password: str = Form(...),
):
    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".pdf")
    src.write_bytes(data)
    try:
        await unlock_pdf(src, out, password)
    except ValueError as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}_unlocked.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/to-word")
async def pdf_to_word_endpoint(file: UploadFile = File(...)):
    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".docx")
    src.write_bytes(data)
    try:
        await pdf_to_word(src, out)
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}.docx"
    mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    file_id = download_manager.register(out, filename, mime)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/to-excel")
async def pdf_to_excel_endpoint(file: UploadFile = File(...)):
    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".xlsx")
    src.write_bytes(data)
    try:
        await pdf_to_excel(src, out)
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {e}")
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}.xlsx"
    mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    file_id = download_manager.register(out, filename, mime)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/repair")
async def repair_pdf_endpoint(file: UploadFile = File(...)):
    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".pdf")
    src.write_bytes(data)
    try:
        await repair_pdf(src, out)
    except ValueError as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=f"Repair failed: {e}")
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}_repaired.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/page-numbers")
async def page_numbers_endpoint(
    file: UploadFile = File(...),
    position: str = Form("bottom-center"),
    font_size: float = Form(11.0),
    start_number: int = Form(1),
):
    valid_positions = {"bottom-center", "bottom-right", "bottom-left", "top-center", "top-right", "top-left"}
    if position not in valid_positions:
        position = "bottom-center"
    font_size = max(6.0, min(24.0, font_size))
    start_number = max(0, start_number)

    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".pdf")
    src.write_bytes(data)
    try:
        await add_page_numbers(src, out, position=position, font_size=font_size, start_number=start_number)
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=f"Failed to add page numbers: {e}")
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}_numbered.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/to-markdown")
async def pdf_to_markdown_endpoint(file: UploadFile = File(...)):
    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".md")
    src.write_bytes(data)
    try:
        await pdf_to_markdown(src, out)
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}.md"
    file_id = download_manager.register(out, filename, "text/markdown")
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/crop")
async def crop_pdf_endpoint(
    file: UploadFile = File(...),
    top: float = Form(0.0),
    bottom: float = Form(0.0),
    left: float = Form(0.0),
    right: float = Form(0.0),
):
    if all(v == 0.0 for v in (top, bottom, left, right)):
        raise HTTPException(status_code=422, detail="At least one crop margin must be greater than 0.")
    for name, val in (("top", top), ("bottom", bottom), ("left", left), ("right", right)):
        if val < 0 or val > 200:
            raise HTTPException(status_code=422, detail=f"Margin '{name}' must be between 0 and 200 mm.")

    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".pdf")
    src.write_bytes(data)
    try:
        await crop_pdf(src, out, top=top, bottom=bottom, left=left, right=right)
    except ValueError as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=f"Crop failed: {e}")
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}_cropped.pdf"
    file_id = download_manager.register(out, filename, _PDF_MIME)
    return _ready(file_id, filename, out.stat().st_size)


@router.post("/to-pptx")
async def pdf_to_pptx_endpoint(file: UploadFile = File(...)):
    validate_file(file, "pdf")
    data = await validate_size(file)

    src = tmp_path(".pdf")
    out = tmp_path(".pptx")
    src.write_bytes(data)
    try:
        await pdf_to_pptx(src, out)
    except Exception as e:
        unlink_quiet(src, out)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")
    finally:
        unlink_quiet(src)

    stem = Path(file.filename or "document").stem
    filename = f"{stem}.pptx"
    mime = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    file_id = download_manager.register(out, filename, mime)
    return _ready(file_id, filename, out.stat().st_size)
