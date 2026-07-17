from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import ALLOWED_ORIGINS
from app.routers import excel_tools, image_tools, pdf_tools, pptx_tools, word_tools
from app.utils.cleanup import start_cleanup_scheduler, stop_cleanup_scheduler

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_cleanup_scheduler()
    yield
    stop_cleanup_scheduler()


app = FastAPI(
    title="PDF Tools API",
    description="File conversion and PDF utility API",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Downloads-Remaining"],
)

app.include_router(pdf_tools.router)
app.include_router(word_tools.router)
app.include_router(excel_tools.router)
app.include_router(pptx_tools.router)
app.include_router(image_tools.router)


@app.get("/")
async def root():
    return {"message": "PDF Tools API is running", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
