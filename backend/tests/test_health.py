"""Health check and root endpoint tests."""

from __future__ import annotations


def test_root_returns_200(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert "message" in resp.json()


def test_health_ok(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_pdf_router_health(client):
    resp = client.get("/api/pdf/health")
    assert resp.status_code == 200
    assert resp.json()["router"] == "pdf_tools"


def test_word_router_health(client):
    resp = client.get("/api/word/health")
    assert resp.status_code == 200
    assert resp.json()["router"] == "word_tools"


def test_excel_router_health(client):
    resp = client.get("/api/excel/health")
    assert resp.status_code == 200
    assert resp.json()["router"] == "excel_tools"


def test_image_router_health(client):
    resp = client.get("/api/image/health")
    assert resp.status_code == 200
    assert resp.json()["router"] == "image_tools"


def test_unknown_route_returns_404(client):
    resp = client.get("/api/does-not-exist")
    assert resp.status_code == 404
