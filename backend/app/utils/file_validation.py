from __future__ import annotations

from fastapi import HTTPException, UploadFile

from app.config import MAX_FILE_SIZE_BYTES

ALLOWED_TYPES: dict[str, list[str]] = {
    "pdf": ["application/pdf"],
    "word": [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    "excel": [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    "image": ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"],
    "pptx": [
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
}


def validate_file(file: UploadFile, allowed_category: str) -> None:
    allowed_mimes = ALLOWED_TYPES.get(allowed_category, [])
    if file.content_type not in allowed_mimes:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Expected: {', '.join(allowed_mimes)}",
        )


async def validate_size(file: UploadFile) -> bytes:
    data = await file.read()
    if len(data) > MAX_FILE_SIZE_BYTES:
        limit_mb = MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Free tier limit is {limit_mb} MB.",
        )
    return data
