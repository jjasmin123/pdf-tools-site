"""Tests for PDF tool endpoints."""

from __future__ import annotations

import io


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _assert_download_ready(resp, status=200):
    assert resp.status_code == status
    data = resp.json()
    assert "file_id" in data
    assert "filename" in data
    assert "size" in data
    assert data["downloads_remaining"] == 2
    assert data["expires_in"] == 600
    return data["file_id"], data["filename"]


# ---------------------------------------------------------------------------
# /api/pdf/compress
# ---------------------------------------------------------------------------

def test_compress_pdf_rejects_non_pdf(client):
    resp = client.post(
        "/api/pdf/compress",
        files={"file": ("photo.jpg", io.BytesIO(b"fake"), "image/jpeg")},
    )
    assert resp.status_code == 415


def test_compress_pdf_rejects_oversized(client):
    big = io.BytesIO(b"x" * (26 * 1024 * 1024))
    resp = client.post(
        "/api/pdf/compress",
        files={"file": ("big.pdf", big, "application/pdf")},
    )
    assert resp.status_code == 413


def test_compress_pdf_accepts_valid_pdf(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/compress",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"level": "balanced"},
    )
    # tiny_pdf is already minimal — expect 422 (already compressed) or ready JSON
    assert resp.status_code in (200, 422)
    if resp.status_code == 200:
        _assert_download_ready(resp)


def test_compress_pdf_level_maximum(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/compress",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"level": "maximum"},
    )
    assert resp.status_code in (200, 422)


def test_compress_pdf_level_light(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/compress",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"level": "light"},
    )
    assert resp.status_code in (200, 422)


# ---------------------------------------------------------------------------
# /api/pdf/to-word  /api/pdf/to-excel
# ---------------------------------------------------------------------------

def test_pdf_to_word_rejects_non_pdf(client):
    resp = client.post(
        "/api/pdf/to-word",
        files={"file": ("sheet.xlsx", io.BytesIO(b"fake"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert resp.status_code == 415


def test_pdf_to_word_rejects_oversized(client):
    big = io.BytesIO(b"x" * (26 * 1024 * 1024))
    resp = client.post(
        "/api/pdf/to-word",
        files={"file": ("big.pdf", big, "application/pdf")},
    )
    assert resp.status_code == 413


def test_pdf_to_excel_rejects_non_pdf(client):
    resp = client.post(
        "/api/pdf/to-excel",
        files={"file": ("doc.docx", io.BytesIO(b"fake"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert resp.status_code == 415


def test_pdf_to_excel_rejects_oversized(client):
    big = io.BytesIO(b"x" * (26 * 1024 * 1024))
    resp = client.post(
        "/api/pdf/to-excel",
        files={"file": ("big.pdf", big, "application/pdf")},
    )
    assert resp.status_code == 413


def test_word_to_pdf_rejects_pdf(client):
    resp = client.post(
        "/api/word/to-pdf",
        files={"file": ("doc.pdf", io.BytesIO(b"fake"), "application/pdf")},
    )
    assert resp.status_code == 415


def test_word_to_pdf_rejects_oversized(client):
    big = io.BytesIO(b"x" * (26 * 1024 * 1024))
    resp = client.post(
        "/api/word/to-pdf",
        files={"file": ("big.docx", big, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert resp.status_code == 413


def test_excel_to_pdf_rejects_pdf(client):
    resp = client.post(
        "/api/excel/to-pdf",
        files={"file": ("doc.pdf", io.BytesIO(b"fake"), "application/pdf")},
    )
    assert resp.status_code == 415


def test_excel_to_pdf_rejects_oversized(client):
    big = io.BytesIO(b"x" * (26 * 1024 * 1024))
    resp = client.post(
        "/api/excel/to-pdf",
        files={"file": ("big.xlsx", big, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert resp.status_code == 413


# ---------------------------------------------------------------------------
# /api/pdf/info
# ---------------------------------------------------------------------------

def test_pdf_info_rejects_non_pdf(client):
    resp = client.post(
        "/api/pdf/info",
        files={"file": ("photo.jpg", io.BytesIO(b"fake"), "image/jpeg")},
    )
    assert resp.status_code == 415


def test_pdf_info_returns_page_count(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/info",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
    )
    assert resp.status_code == 200
    assert "page_count" in resp.json()
    assert resp.json()["page_count"] >= 1


# ---------------------------------------------------------------------------
# /api/pdf/rotate
# ---------------------------------------------------------------------------

def test_rotate_pdf_rejects_non_pdf(client):
    resp = client.post(
        "/api/pdf/rotate",
        files={"file": ("photo.jpg", io.BytesIO(b"fake"), "image/jpeg")},
        data={"rotation": "90", "pages": "all"},
    )
    assert resp.status_code == 415


def test_rotate_pdf_accepts_valid_pdf(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/rotate",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"rotation": "90", "pages": "all"},
    )
    _assert_download_ready(resp)


def test_rotate_pdf_download_limit(client, tiny_pdf):
    post = client.post(
        "/api/pdf/rotate",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"rotation": "90", "pages": "all"},
    )
    assert post.status_code == 200
    file_id = post.json()["file_id"]

    r1 = client.get(f"/api/pdf/download/{file_id}")
    assert r1.status_code == 200
    assert r1.headers["x-downloads-remaining"] == "1"

    r2 = client.get(f"/api/pdf/download/{file_id}")
    assert r2.status_code == 200
    assert r2.headers["x-downloads-remaining"] == "0"

    r3 = client.get(f"/api/pdf/download/{file_id}")
    assert r3.status_code == 404


# ---------------------------------------------------------------------------
# /api/pdf/reorder
# ---------------------------------------------------------------------------

def test_reorder_pdf_rejects_non_pdf(client):
    resp = client.post(
        "/api/pdf/reorder",
        files={"file": ("photo.jpg", io.BytesIO(b"fake"), "image/jpeg")},
        data={"order": "[0]"},
    )
    assert resp.status_code == 415


def test_reorder_pdf_accepts_valid_pdf(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/reorder",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"order": "[0]"},
    )
    _assert_download_ready(resp)


def test_reorder_pdf_rejects_invalid_order(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/reorder",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"order": "not-json"},
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# /api/pdf/watermark
# ---------------------------------------------------------------------------

def test_watermark_pdf_rejects_non_pdf(client):
    resp = client.post(
        "/api/pdf/watermark",
        files={"file": ("photo.jpg", io.BytesIO(b"fake"), "image/jpeg")},
        data={"text": "DRAFT", "opacity": "0.3", "color": "#808080"},
    )
    assert resp.status_code == 415


def test_watermark_pdf_accepts_valid_pdf(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/watermark",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"text": "CONFIDENTIAL", "opacity": "0.3", "color": "#808080"},
    )
    _assert_download_ready(resp)


# ---------------------------------------------------------------------------
# /api/pdf/protect
# ---------------------------------------------------------------------------

def test_protect_pdf_rejects_non_pdf(client):
    resp = client.post(
        "/api/pdf/protect",
        files={"file": ("photo.jpg", io.BytesIO(b"fake"), "image/jpeg")},
        data={"password": "secret123"},
    )
    assert resp.status_code == 415


def test_protect_pdf_accepts_valid_pdf(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/protect",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"password": "secret123"},
    )
    _assert_download_ready(resp)


# ---------------------------------------------------------------------------
# /api/pdf/unlock
# ---------------------------------------------------------------------------

def test_unlock_pdf_rejects_non_pdf(client):
    resp = client.post(
        "/api/pdf/unlock",
        files={"file": ("photo.jpg", io.BytesIO(b"fake"), "image/jpeg")},
        data={"password": "secret"},
    )
    assert resp.status_code == 415


def test_unlock_pdf_rejects_unprotected_pdf(client, tiny_pdf):
    resp = client.post(
        "/api/pdf/unlock",
        files={"file": ("doc.pdf", io.BytesIO(tiny_pdf), "application/pdf")},
        data={"password": "wrongpass"},
    )
    # tiny_pdf is not encrypted → 422
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# /api/pdf/download/{file_id} — unknown ID
# ---------------------------------------------------------------------------

def test_download_unknown_file_id_returns_404(client):
    resp = client.get("/api/pdf/download/doesnotexist123")
    assert resp.status_code == 404
