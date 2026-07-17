from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api/image", tags=["Image Tools"])


@router.get("/health")
async def image_health():
    return {"status": "ok", "router": "image_tools"}


# Phase 2 endpoints:
# POST /api/image/compress
# POST /api/image/to-pdf
