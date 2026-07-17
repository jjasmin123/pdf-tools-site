"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import ProgressBar from "./ProgressBar";
import DownloadButton from "./DownloadButton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const COLOR_PRESETS = [
  { label: "Gray", value: "#808080" },
  { label: "Red", value: "#cc0000" },
  { label: "Blue", value: "#0044cc" },
  { label: "Black", value: "#111111" },
];

const TEXT_PRESETS = ["CONFIDENTIAL", "DRAFT", "DO NOT COPY", "SAMPLE"];

function fmt(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);
  const [color, setColor] = useState("#808080");
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

  async function applyWatermark() {
    if (!file || !text.trim()) return;
    setStatus("uploading");
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("text", text.trim());
    form.append("opacity", String(opacity));
    form.append("color", color);
    try {
      const resp = await fetch(`${API_BASE}/api/pdf/watermark`, { method: "POST", body: form });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ detail: "Watermark failed." }));
        throw new Error(typeof body.detail === "string" ? body.detail : "Watermark failed.");
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
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Watermark text</label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL, DRAFT…"
                      maxLength={40}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                    />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {TEXT_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setText(preset)}
                          className={`text-xs px-3 py-1 rounded-full border transition-all ${
                            text === preset
                              ? "border-red-500 bg-red-50 text-red-600"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Opacity</span>
                      <span className="font-bold text-red-600">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={80}
                      value={Math.round(opacity * 100)}
                      onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                      className="w-full accent-red-500"
                    />
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Subtle</span>
                      <span>Bold</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Color</p>
                    <div className="flex gap-2 items-center">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setColor(c.value)}
                          title={c.label}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            color === c.value ? "border-red-500 scale-110" : "border-gray-200"
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        title="Custom color"
                        className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer overflow-hidden"
                      />
                    </div>
                  </div>

                  <button
                    onClick={applyWatermark}
                    disabled={!text.trim()}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Watermark
                  </button>
                </div>
              )}
            </>
          )}

          {status === "uploading" && <ProgressBar label="Stamping watermark on all pages…" />}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm font-medium">Watermark failed</p>
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
            <p className="font-semibold text-gray-800 text-lg">Watermark added!</p>
            <p className="text-sm text-gray-400 mt-1">{downloadName}</p>
          </div>
          <DownloadButton fileId={downloadId} filename={downloadName} label="Download" />
          <div>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline">Watermark another file</button>
          </div>
        </div>
      )}
    </div>
  );
}
