from __future__ import annotations

import asyncio
import subprocess
from pathlib import Path

from app.config import LIBREOFFICE_PATH


async def convert_to_pdf(input_path: Path, output_dir: Path) -> Path:
    """
    Run LibreOffice headlessly to convert any supported format → PDF.
    Returns the path to the generated PDF file.
    Raises RuntimeError with a clear message on failure.
    """
    cmd = [
        LIBREOFFICE_PATH,
        "--headless",
        "--norestore",
        "--convert-to", "pdf",
        "--outdir", str(output_dir),
        str(input_path),
    ]

    try:
        result = await asyncio.to_thread(
            subprocess.run,
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
        )
    except FileNotFoundError:
        raise RuntimeError(
            f"LibreOffice not found at '{LIBREOFFICE_PATH}'. "
            "Please install LibreOffice and set LIBREOFFICE_PATH in your .env file."
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("Conversion timed out after 120 seconds.")

    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or "Unknown LibreOffice error"
        raise RuntimeError(f"LibreOffice conversion failed: {detail}")

    # LibreOffice names the output file the same stem as the input
    output_pdf = output_dir / (input_path.stem + ".pdf")
    if not output_pdf.exists():
        raise RuntimeError(
            "LibreOffice ran but the output PDF was not created. "
            "The file may be corrupted or password-protected."
        )

    return output_pdf
