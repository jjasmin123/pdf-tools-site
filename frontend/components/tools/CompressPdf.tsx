"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import ProgressBar from "./ProgressBar";
import DownloadButton from "./DownloadButton";

type Level = "light" | "balanced" | "maximum";

const LEVELS: { value: Level; label: string; icon: string; hint: string }[] = [
  { value: "light", label: "Light", icon: "🍃", hint: "Fastest · minimal quality change" },
  { value: "balanced", label: "Balanced", icon: "⚖️", hint: "Good reduction · safe for all PDFs" },
  { value: "maximum", label: "Maximum", icon: "🗜️", hint: "Smallest file · may affect fonts" },
];

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>("balanced");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [downloadId, setDownloadId] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [compressedSize, setCompressedSize] = useState(0);
  const [error, setError] = useState("");

  function onFiles(incoming: File[]) {
    if (incoming.length === 0) return;
    setFile(incoming[0]);
    setStatus("idle");
    setDownloadId("");
    setError("");
  }

  async function compress() {
    if (!file) return;
    setStatus("uploading");
    setError("");

    const form = new FormData();
    form.append("file", file);
    form.append("level", level);

    try {
      const resp = await fetch(`${API_BASE}/api/pdf/compress`, { method: "POST", body: form });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ detail: "Compression failed." }));
        const msg = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
        throw new Error(msg);
      }

      const data = await resp.json();
      setDownloadId(data.file_id);
      setDownloadName(data.filename);
      setCompressedSize(data.size);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function reset() {
    setFile(null);
    setDownloadId("");
    setDownloadName("");
    setCompressedSize(0);
    setStatus("idle");
    setError("");
  }

  const savedBytes = file && compressedSize ? file.size - compressedSize : 0;
  const savedPct = file && compressedSize ? Math.round((savedBytes / file.size) * 100) : 0;

  return (
    <div className="space-y-6">
      {status !== "done" && (
        <>
          {!file ? (
            <UploadZone
              accept="application/pdf"
              onFiles={onFiles}
              hint="Accepted: .pdf · max 25 MB"
            />
          ) : (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 truncate min-w-0">
                    <span className="shrink-0">📄</span>
                    <span className="truncate">{file.name}</span>
                  </span>
                  <button
                    onClick={reset}
                    className="text-gray-300 hover:text-red-400 transition-colors ml-3 shrink-0 text-lg leading-none"
                    aria-label="Remove file"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{fmt(file.size)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Current file size</p>
              </div>

              {status !== "uploading" && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">How much to compress?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setLevel(l.value)}
                        className={`py-3 px-2 rounded-xl border-2 text-center transition-all ${
                          level === l.value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <span className="text-xl block mb-1">{l.icon}</span>
                        <p
                          className={`text-sm font-semibold ${level === l.value ? "text-red-600" : "text-gray-700"}`}
                        >
                          {l.label}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{l.hint}</p>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={compress}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Compress PDF
                  </button>
                </div>
              )}
            </>
          )}

          {status === "uploading" && (
            <ProgressBar label="Compressing… this may take a few seconds" />
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm font-medium">Compression failed</p>
              <p className="text-red-500 text-xs mt-1">{error}</p>
              <button
                onClick={() => setStatus("idle")}
                className="text-xs text-red-600 underline mt-2"
              >
                Try again
              </button>
            </div>
          )}
        </>
      )}

      {status === "done" && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Original</span>
              <span className="font-semibold text-gray-700">{file ? fmt(file.size) : ""}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Compressed</span>
              <span className="font-bold text-green-700">{fmt(compressedSize)}</span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div
                className="h-2 bg-green-500 rounded-full transition-all"
                style={{ width: `${100 - savedPct}%` }}
              />
            </div>
            <p className="text-center text-green-700 font-semibold text-sm">
              {savedPct}% smaller — saved {fmt(savedBytes)}
            </p>
          </div>

          <DownloadButton
            fileId={downloadId}
            filename={downloadName}
            label="Download compressed PDF"
          />

          <button
            onClick={reset}
            className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
          >
            Compress another file
          </button>
        </div>
      )}
    </div>
  );
}
