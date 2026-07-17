"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import ProgressBar from "./ProgressBar";
import DownloadButton from "./DownloadButton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function fmt(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function MarginInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          max={200}
          step={1}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(200, Number(e.target.value) || 0)))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-center"
        />
        <span className="text-xs text-gray-400 shrink-0">mm</span>
      </div>
    </div>
  );
}

export default function CropPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
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
    if (top === 0 && bottom === 0 && left === 0 && right === 0) {
      setError("Set at least one margin greater than 0.");
      return;
    }
    setStatus("uploading");
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("top", String(top));
    form.append("bottom", String(bottom));
    form.append("left", String(left));
    form.append("right", String(right));
    try {
      const resp = await fetch(`${API_BASE}/api/pdf/crop`, { method: "POST", body: form });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ detail: "Crop failed." }));
        throw new Error(typeof body.detail === "string" ? body.detail : "Crop failed.");
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
    setTop(0);
    setBottom(0);
    setLeft(0);
    setRight(0);
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
                  <p className="text-sm text-gray-500">
                    Enter how many millimetres to remove from each side of every page.
                  </p>

                  {/* Visual crop layout */}
                  <div className="grid grid-cols-3 gap-3 items-center">
                    <div />
                    <MarginInput label="Top" value={top} onChange={setTop} />
                    <div />
                    <MarginInput label="Left" value={left} onChange={setLeft} />
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-20 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                    </div>
                    <MarginInput label="Right" value={right} onChange={setRight} />
                    <div />
                    <MarginInput label="Bottom" value={bottom} onChange={setBottom} />
                    <div />
                  </div>

                  <button
                    onClick={apply}
                    className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    Crop PDF
                  </button>
                </div>
              )}
            </>
          )}

          {status === "uploading" && <ProgressBar label="Cropping PDF…" />}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm font-medium">Crop failed</p>
              <p className="text-red-500 text-xs mt-1">{error}</p>
              <button onClick={() => setStatus("idle")} className="text-xs text-red-600 underline mt-2">Try again</button>
            </div>
          )}
        </>
      )}

      {status === "done" && (
        <div className="text-center space-y-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto border border-orange-200 bg-orange-50">✅</div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">PDF cropped!</p>
            <p className="text-sm text-gray-400 mt-1">{downloadName}</p>
          </div>
          <DownloadButton fileId={downloadId} filename={downloadName} label="Download" />
          <div>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline">Crop another file</button>
          </div>
        </div>
      )}
    </div>
  );
}
