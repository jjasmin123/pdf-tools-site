#!/bin/bash
set -e

# Install LibreOffice (needed for Word/Excel/PPTX → PDF conversion)
apt-get update -qq
apt-get install -y -qq libreoffice --no-install-recommends

# Install Python dependencies
pip install -r requirements.txt
