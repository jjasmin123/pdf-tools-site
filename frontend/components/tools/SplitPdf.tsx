"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import UploadZone from "./UploadZone";
import ProgressBar from "./ProgressBar";

type Mode = "all" | "range";

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [mode, setMode] = useState<Mode>("all");
  const [rangeInput, setRangeInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">(
    "idle",
  );
  const [results, setResults] = useState<{ name: string; url: string }[]>([]);
  const [error, setError] = useState("");

  async function onFiles(incoming: File[]) {
    const pdf = incoming.find((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (!pdf) return;
    setFile(pdf);
    setStatus("loading");
    setResults([]);
    setError("");
    try {
      const bytes = await pdf.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setTotalPages(doc.getPageCount());
      setStatus("idle");
    } catch {
      setError("Could not read this PDF. Make sure it is not password-protected.");
      setStatus("error");
    }
  }

  function parseRange(input: string, max: number): number[] {
    const pages = new Set<number>();
    for (const part of input.split(",")) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [a, b] = trimmed.split("-").map(Number);
        if (!isNaN(a) && !isNaN(b)) {
          for (let i = Math.min(a, b); i <= Math.min(Math.max(a, b), max); i++) pages.add(i);
        }
      } else {
        const n = Number(trimmed);
        if (!isNaN(n) && n >= 1 && n <= max) pages.add(n);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  async function split() {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const out: { name: string; url: string }[] = [];

      if (mode === "all") {
        for (let i = 0; i < src.getPageCount(); i++) {
          const single = await PDFDocument.create();
          const [page] = await single.copyPages(src, [i]);
          single.addPage(page);
          const blob = new Blob([(await single.save()).buffer as ArrayBuffer], {
            type: "application/pdf",
          });
          out.push({ name: `page-${i + 1}.pdf`, url: URL.createObjectURL(blob) });
        }
      } else {
        const pages = parseRange(rangeInput, totalPages);
        if (pages.length === 0) {
          setError("No valid pages in that range. Pages are numbered from 1.");
          setStatus("error");
          return;
        }
        const extracted = await PDFDocument.create();
        const copied = await extracted.copyPages(
          src,
          pages.map((p) => p - 1),
        );
        copied.forEach((p) => extracted.addPage(p));
        const blob = new Blob([(await extracted.save()).buffer as ArrayBuffer], {
          type: "application/pdf",
        });
        out.push({
          name: `pages-${pages[0]}-to-${pages[pages.length - 1]}.pdf`,
          url: URL.createObjectURL(blob),
        });
      }

      setResults(out);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed.");
      setStatus("error");
    }
  }

  function reset() {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setFile(null);
    setTotalPages(0);
    setResults([]);
    setStatus("idle");
    setError("");
    setRangeInput("");
  }

  return (
    <div className="space-y-6">
      {status !== "done" && (
        <>
          {!file ? (
            <UploadZone
              accept="application/pdf"
              onFiles={onFiles}
              hint="One PDF at a time · no password-protected files"
            />
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700 truncate">
                <span>📄</span> {file.name}
                <span className="text-gray-400 font-normal">· {totalPages} pages</span>
              </span>
              <button
                onClick={reset}
                className="text-gray-300 hover:text-red-400 transition-colors ml-3"
              >
                ✕
              </button>
            </div>
          )}

          {file && totalPages > 0 && status !== "processing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["all", "range"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      mode === m
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {m === "all" ? `Split into ${totalPages} pages` : "Extract page range"}
                  </button>
                ))}
              </div>

              {mode === "range" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page range (e.g. 1-3, 5, 7-9)
                  </label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder={`1-${totalPages}`}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <p className="text-xs text-gray-400 mt-1">PDF has {totalPages} pages</p>
                </div>
              )}

              <button
                onClick={split}
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                {mode === "all" ? `Split into ${totalPages} individual PDFs` : "Extract pages"}
              </button>
            </div>
          )}

          {status === "processing" && <ProgressBar label="Splitting PDF…" />}
          {status === "loading" && <ProgressBar label="Reading PDF…" />}
          {status === "error" && <p className="text-red-500 text-sm text-center">{error}</p>}
        </>
      )}

      {status === "done" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">
            {results.length === 1 ? "Extracted PDF" : `${results.length} PDFs ready`}
          </h3>
          <ul className="space-y-2">
            {results.map((r) => (
              <li
                key={r.name}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
              >
                <span className="text-sm text-gray-700 font-medium truncate flex items-center gap-2">
                  <span>📄</span> {r.name}
                </span>
                <a
                  href={r.url}
                  download={r.name}
                  className="shrink-0 ml-3 bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
          <button
            onClick={reset}
            className="w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Split another PDF
          </button>
        </div>
      )}
    </div>
  );
}
