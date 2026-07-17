# PDF Tools Site

A fast, clean file conversion and PDF utility web app.

## Requirements

- Python 3.10+
- Node.js 18+
- LibreOffice (for Phase 2 server-side conversions)

## Running Locally

### Backend (Terminal 1)

```bash
cd backend
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Site available at: http://localhost:3000

## Environment Variables

Copy the example files and fill in values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

## Project Structure

```
pdf-tools-site/
├── backend/               FastAPI Python API
│   ├── venv/              Python virtual env (gitignored)
│   ├── app/
│   │   ├── main.py        FastAPI entrypoint
│   │   ├── routers/       One router per tool category
│   │   ├── services/      Conversion logic
│   │   └── utils/         Validation, cleanup, rate limiting
│   └── requirements.txt
└── frontend/              Next.js + Tailwind + TypeScript
    ├── app/               App Router pages
    └── components/        Reusable UI components
```

## Phase Status

- [x] Phase 1 — Client-side tools + project scaffold
- [ ] Phase 2 — Backend conversions (Word, Excel, PowerPoint ↔ PDF)
