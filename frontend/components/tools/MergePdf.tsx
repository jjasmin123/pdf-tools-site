"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import UploadZone from "./UploadZone";
import FileList from "./FileList";
import ProgressBar from "./ProgressBar";

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState("");

  function onFiles(incoming: File[]) {
    const pdfs = incoming.filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    setFiles((prev) => [...prev, ...pdfs]);
    setStatus("idle");
    setPdfUrl("");
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function merge() {
    if (files.length < 2) return;
    setStatus("processing");
    setError("");
    try {
      const merged = await PDFDocument.create();
      let total = 0;

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => {
          merged.addPage(p);
          total++;
        });
      }

      const outBytes = await merged.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
      setPageCount(total);
      setStatus("done");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Merge failed. Make sure the PDFs are not password-protected.",
      );
      setStatus("error");
    }
  }

  function reset() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setFiles([]);
    setPdfUrl("");
    setStatus("idle");
    setError("");
    setPageCount(0);
  }

  return (
    <div className="space-y-6">
      {status !== "done" && (
        <>
          <UploadZone
            accept="application/pdf"
            multiple
            onFiles={onFiles}
            hint="Add PDFs in the order you want them merged · no password-protected files"
          />
          <FileList files={files} onRemove={removeFile} />

          {files.length > 0 && status !== "processing" && (
            <div className="space-y-2">
              {files.length < 2 && (
                <p className="text-center text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg py-2">
                  Add at least one more PDF to merge
                </p>
              )}
              <button
                onClick={merge}
                disabled={files.length < 2}
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Merge {files.length} PDFs
              </button>
            </div>
          )}
          {status === "processing" && <ProgressBar label="Merging PDFs…" />}
          {status === "error" && <p className="text-red-500 text-sm text-center">{error}</p>}
        </>
      )}

      {status === "done" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl mx-auto">
            ✅
          </div>
          <div>
            <p className="font-semibold text-gray-800">Merged PDF is ready!</p>
            <p className="text-sm text-gray-400">
              {files.length} files · {pageCount} pages total
            </p>
          </div>
          <a
            href={pdfUrl}
            download="merged.pdf"
            className="inline-block bg-red-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            Download merged PDF
          </a>
          <div>
            <button
              onClick={reset}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Merge more PDFs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
