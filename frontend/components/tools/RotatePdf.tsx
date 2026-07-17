"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import ProgressBar from "./ProgressBar";
import DownloadButton from "./DownloadButton";

type Rotation = 90 | 180 | 270;

const ROTATIONS: { value: Rotation; label: string; icon: string; hint: string }[] = [
  { value: 90, label: "90° Clockwise", icon: "↻", hint: "Rotate right" },
  { value: 180, label: "180°", icon: "↕", hint: "Flip upside down" },
  { value: 270, label: "90° Counter-CW", icon: "↺", hint: "Rotate left" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function fmt(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<Rotation>(90);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [downloadId, setDownloadId] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [error, setError] = useState("");

  function onFiles(incoming: File[]) {
    if (incoming.length === 0) return;
    setFile(incoming[0]);
    setStatus("idle");
    setDownloadId("");
    setError("");
  }

  async function rotate() {
    if (!file) return;
    setStatus("uploading");
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("rotation", String(rotation));
    form.append("pages", "all");
    try {
      const resp = await fetch(`${API_BASE}/api/pdf/rotate`, { method: "POST", body: form });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ detail: "Rotation failed." }));
        throw new Error(typeof body.detail === "string" ? body.detail : "Rotation failed.");
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
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Choose rotation</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ROTATIONS.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRotation(r.value)}
                        className={`py-4 px-2 rounded-xl border-2 text-center transition-all ${
                          rotation === r.value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <span className={`text-2xl block mb-1 ${rotation === r.value ? "text-red-500" : "text-gray-400"}`}>{r.icon}</span>
                        <p className={`text-sm font-semibold ${rotation === r.value ? "text-red-600" : "text-gray-700"}`}>{r.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{r.hint}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-center">Applies to all pages</p>
                  <button
                    onClick={rotate}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Rotate PDF
                  </button>
                </div>
              )}
            </>
          )}

          {status === "uploading" && <ProgressBar label="Rotating pages…" />}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm font-medium">Rotation failed</p>
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
            <p className="font-semibold text-gray-800 text-lg">PDF rotated!</p>
            <p className="text-sm text-gray-400 mt-1">{downloadName}</p>
          </div>
          <DownloadButton fileId={downloadId} filename={downloadName} label="Download" />
          <div>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline">Rotate another file</button>
          </div>
        </div>
      )}
    </div>
  );
}
