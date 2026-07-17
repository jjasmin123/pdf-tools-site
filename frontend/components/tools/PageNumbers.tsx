"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import ProgressBar from "./ProgressBar";
import DownloadButton from "./DownloadButton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const POSITIONS = [
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right",  label: "Bottom Right"  },
  { value: "bottom-left",   label: "Bottom Left"   },
  { value: "top-center",    label: "Top Center"    },
  { value: "top-right",     label: "Top Right"     },
  { value: "top-left",      label: "Top Left"      },
];

function fmt(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState("bottom-center");
  const [fontSize, setFontSize] = useState(11);
  const [startNumber, setStartNumber] = useState(1);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [downloadId, setDownloadId] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [error, setError] = useState("");

  function onFiles(incoming: File[]) {
    if (!incoming.length) return;
    setFile(incoming[0]);
    setStatus("idle");
    setDownloadId("");
    setError("");
  }

  async function apply() {
    if (!file) return;
    setStatus("uploading");
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("position", position);
    form.append("font_size", String(fontSize));
    form.append("start_number", String(startNumber));
    try {
      const resp = await fetch(`${API_BASE}/api/pdf/page-numbers`, { method: "POST", body: form });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ detail: "Failed to add page numbers." }));
        throw new Error(typeof body.detail === "string" ? body.detail : "Failed.");
      }
      const data = await resp.json();
      setDownloadId(data.file_id);
      setDownloadName(data.filename);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function reset() {
    setFile(null);
    setDownloadId("");
    setDownloadName("");
    setStatus("idle");
    setError("");
  }

  return (
    <div className="space-y-6">
      {status !== "done" && (
        <>
          {!file ? (
            <UploadZone accept="application/pdf" onFiles={onFiles} hint="Accepted: .pdf · max 25 MB" />
          ) : (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 truncate min-w-0">
                  <span className="shrink-0">📄</span>
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-400 font-normal shrink-0">{fmt(file.size)}</span>
                </span>
                <button onClick={reset} className="text-gray-300 hover:text-red-400 transition-colors ml-3 shrink-0">✕</button>
              </div>

              {status !== "uploading" && (
                <div className="space-y-4">
                  {/* Position */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {POSITIONS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPosition(p.value)}
                          className={`py-2 px-3 rounded-xl border-2 text-center text-sm transition-all ${
                            position === p.value
                              ? "border-red-500 bg-red-50 text-red-600 font-semibold"
                              : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font size + start number */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Font size</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={7}
                          max={20}
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="flex-1 accent-red-500"
                        />
                        <span className="text-sm font-bold text-red-600 w-8 text-right">{fontSize}pt</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Start at</label>
                      <input
                        type="number"
                        min={0}
                        max={9999}
                        value={startNumber}
                        onChange={(e) => setStartNumber(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={apply}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Add Page Numbers
                  </button>
                </div>
              )}
            </>
          )}

          {status === "uploading" && <ProgressBar label="Adding page numbers…" />}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm font-medium">Failed to add page numbers</p>
              <p className="text-red-500 text-xs mt-1">{error}</p>
              <button onClick={() => setStatus("idle")} className="text-xs text-red-600 underline mt-2">Try again</button>
            </div>
          )}
        </>
      )}

      {status === "done" && (
        <div className="text-center space-y-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto border border-red-200 bg-red-50">✅</div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">Page numbers added!</p>
            <p className="text-sm text-gray-400 mt-1">{downloadName}</p>
          </div>
          <DownloadButton fileId={downloadId} filename={downloadName} label="Download" />
          <div>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline">Number another file</button>
          </div>
        </div>
      )}
    </div>
  );
}
