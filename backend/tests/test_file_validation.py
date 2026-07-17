"""Unit tests for file_validation helpers."""

from __future__ import annotations

import io

import pytest
from fastapi import HTTPException
from starlette.datastructures import UploadFile

from app.utils.file_validation import ALLOWED_TYPES, validate_file, validate_size

# ── validate_file ─────────────────────────────────────────────────────────────


def _make_upload(content_type: str, filename: str = "test") -> UploadFile:
    return UploadFile(
        filename=filename, file=io.BytesIO(b"data"), headers={"content-type": content_type}
    )


def test_valid_pdf_passes():
    upload = _make_upload("application/pdf", "doc.pdf")
    validate_file(upload, "pdf")  # should not raise


def test_valid_jpeg_passes():
    upload = _make_upload("image/jpeg", "photo.jpg")
    validate_file(upload, "image")


def test_valid_docx_passes():
    upload = _make_upload(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "report.docx",
    )
    validate_file(upload, "word")


def test_wrong_category_raises_415():
    upload = _make_upload("image/jpeg", "photo.jpg")
    with pytest.raises(HTTPException) as exc:
        validate_file(upload, "pdf")
    assert exc.value.status_code == 415


def test_unknown_mime_raises_415():
    upload = _make_upload("application/x-unknown", "file.bin")
    with pytest.raises(HTTPException) as exc:
        validate_file(upload, "pdf")
    assert exc.value.status_code == 415


def test_error_message_mentions_expected_types():
    upload = _make_upload("text/plain", "note.txt")
    with pytest.raises(HTTPException) as exc:
        validate_file(upload, "pdf")
    assert "application/pdf" in exc.value.detail


# ── validate_size ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_small_file_passes():
    data = b"x" * 1024  # 1 KB
    upload = UploadFile(filename="small.pdf", file=io.BytesIO(data))
    result = await validate_size(upload)
    assert result == data


@pytest.mark.asyncio
async def test_oversized_file_raises_413():
    # 26 MB — above the 25 MB limit
    data = b"x" * (26 * 1024 * 1024)
    upload = UploadFile(filename="huge.pdf", file=io.BytesIO(data))
    with pytest.raises(HTTPException) as exc:
        await validate_size(upload)
    assert exc.value.status_code == 413
    assert "25 MB" in exc.value.detail


@pytest.mark.asyncio
async def test_exactly_at_limit_passes():
    data = b"x" * (25 * 1024 * 1024)
    upload = UploadFile(filename="exact.pdf", file=io.BytesIO(data))
    result = await validate_size(upload)
    assert len(result) == 25 * 1024 * 1024


# ── ALLOWED_TYPES sanity checks ───────────────────────────────────────────────


def test_allowed_types_covers_all_categories():
    expected = {"pdf", "word", "excel", "image", "pptx"}
    assert expected == set(ALLOWED_TYPES.keys())


def test_pdf_category_only_allows_pdf_mime():
    assert ALLOWED_TYPES["pdf"] == ["application/pdf"]
