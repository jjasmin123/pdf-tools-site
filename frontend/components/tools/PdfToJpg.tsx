"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import ProgressBar from "./ProgressBar";

type PageResult = { name: string; url: string; page: number };

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [results, setResults] = useState<PageResult[]>([]);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  function onFiles(incoming: File[]) {
    const pdf = incoming.find((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (!pdf) return;
    setFile(pdf);
    setStatus("idle");
    setResults([]);
    setError("");
  }

  async function convert() {
    if (!file) return;
    setStatus("processing");
    setProgress("Loading PDF…");
    setError("");

    try {
      // Dynamic import to avoid SSR issues with pdfjs-dist 6.x
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const total = pdf.numPages;
      const out: PageResult[] = [];

      for (let i = 1; i <= total; i++) {
        setProgress(`Rendering page ${i} of ${total}…`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 }); // 2x = ~150dpi
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const blob = await new Promise<Blob>((res) =>
          canvas.toBlob((b) => res(b!), "image/jpeg", 0.92),
        );
        const url = URL.createObjectURL(blob);
        const baseName = file.name.replace(/\.pdf$/i, "");
        out.push({ name: `${baseName}-page-${i}.jpg`, url, page: i });
      }

      setResults(out);
      setStatus("done");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Conversion failed. Make sure the PDF is not password-protected.",
      );
      setStatus("error");
    }
  }

  async function downloadAll() {
    for (const r of results) {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = r.name;
      a.click();
      await new Promise((res) => setTimeout(res, 200));
    }
  }

  function reset() {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setFile(null);
    setResults([]);
    setStatus("idle");
    setError("");
    setProgress("");
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
              </span>
              <button
                onClick={() => {
                  setFile(null);
                  setStatus("idle");
                }}
                className="text-gray-300 hover:text-red-400 transition-colors ml-3"
              >
                ✕
              </button>
            </div>
          )}

          {file && status === "idle" && (
            <button
              onClick={convert}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
            >
              Convert to JPG images
            </button>
          )}

          {status === "processing" && <ProgressBar label={progress} />}
          {status === "error" && <p className="text-red-500 text-sm text-center">{error}</p>}
        </>
      )}

      {status === "done" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{results.length} pages converted</h3>
            {results.length > 1 && (
              <button
                onClick={downloadAll}
                className="text-sm bg-red-600 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                Download all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((r) => (
              <div
                key={r.page}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm group"
              >
                <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.url}
                    alt={`Page ${r.page}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Page {r.page}</span>
                  <a
                    href={r.url}
                    download={r.name}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={reset}
            className="w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Convert another PDF
          </button>
        </div>
      )}
    </div>
  );
}
