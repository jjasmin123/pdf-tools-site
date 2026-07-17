"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import UploadZone from "./UploadZone";
import FileList from "./FileList";
import ProgressBar from "./ProgressBar";

type Mode = "quality" | "target";
type Result = { name: string; originalSize: number; compressedSize: number; url: string };

function fmt(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

const QUALITY_PRESETS = [
  { label: "High quality", value: 85, hint: "~20–30% smaller, looks the same" },
  { label: "Balanced", value: 65, hint: "~50–60% smaller, slight loss" },
  { label: "Small file", value: 35, hint: "~70–80% smaller, noticeable loss" },
];

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<Mode>("quality");

  // quality mode
  const [quality, setQuality] = useState(85);

  // target size mode
  const [targetValue, setTargetValue] = useState("500");
  const [targetUnit, setTargetUnit] = useState<"KB" | "MB">("KB");

  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");

  function onFiles(incoming: File[]) {
    const images = incoming.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...images]);
    setStatus("idle");
    setResults([]);
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function getMaxSizeMB(file: File): number {
    if (mode === "target") {
      const num = parseFloat(targetValue);
      if (isNaN(num) || num <= 0) return 0.5;
      return targetUnit === "KB" ? num / 1024 : num;
    }
    // quality mode: derive a rough maxSizeMB from quality %
    return Math.max((file.size / (1024 * 1024)) * (quality / 100), 0.02);
  }

  async function compress() {
    if (files.length === 0) return;
    setStatus("processing");
    setError("");
    const out: Result[] = [];
    try {
      for (const file of files) {
        const maxSizeMB = getMaxSizeMB(file);
        const compressed = await imageCompression(file, {
          maxSizeMB,
          maxWidthOrHeight: 4096,
          useWebWorker: true,
          initialQuality: quality / 100,
          fileType: file.type as "image/jpeg" | "image/png" | "image/webp",
        });
        out.push({
          name: file.name,
          originalSize: file.size,
          compressedSize: compressed.size,
          url: URL.createObjectURL(compressed),
        });
      }
      setResults(out);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed.");
      setStatus("error");
    }
  }

  function reset() {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setFiles([]);
    setResults([]);
    setStatus("idle");
    setError("");
  }

  const totalOriginal = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="space-y-6">
      {status !== "done" && (
        <>
          <UploadZone
            accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
            multiple
            onFiles={onFiles}
            hint="JPEG, PNG, WebP · up to 25 MB each · multiple files supported"
          />
          <FileList files={files} onRemove={removeFile} />

          {files.length > 0 && status !== "processing" && (
            <div className="space-y-5">
              {/* Current total size callout */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {files.length} image{files.length > 1 ? "s" : ""} selected
                </span>
                <span className="font-semibold text-gray-800">Total: {fmt(totalOriginal)}</span>
              </div>

              {/* Mode toggle */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  How do you want to compress?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(["quality", "target"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                        mode === m
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {m === "quality" ? (
                        <span>
                          🎚 By quality
                          <br />
                          <span className="text-xs font-normal text-gray-400">
                            Choose High / Balanced / Small
                          </span>
                        </span>
                      ) : (
                        <span>
                          🎯 By target size
                          <br />
                          <span className="text-xs font-normal text-gray-400">
                            Set a max KB or MB per file
                          </span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality mode */}
              {mode === "quality" && (
                <div className="space-y-3">
                  {/* Preset buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {QUALITY_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setQuality(p.value)}
                        className={`py-2.5 px-2 rounded-xl border-2 text-center transition-all ${
                          quality === p.value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p
                          className={`text-sm font-semibold ${quality === p.value ? "text-red-600" : "text-gray-700"}`}
                        >
                          {p.label}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{p.hint}</p>
                      </button>
                    ))}
                  </div>

                  {/* Fine-tune slider */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fine-tune quality</span>
                      <span className="font-bold text-red-600">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Smallest file</span>
                      <span>Best quality</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Target size mode */}
              {mode === "target" && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-gray-600 font-medium">Compress each image to under:</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                      placeholder="500"
                    />
                    <select
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(e.target.value as "KB" | "MB")}
                      className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>

                  {/* Quick size presets */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "100 KB", v: "100", u: "KB" },
                      { label: "500 KB", v: "500", u: "KB" },
                      { label: "1 MB", v: "1", u: "MB" },
                      { label: "2 MB", v: "2", u: "MB" },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setTargetValue(p.v);
                          setTargetUnit(p.u as "KB" | "MB");
                        }}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                          targetValue === p.v && targetUnit === p.u
                            ? "border-red-500 bg-red-50 text-red-600"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Note: very low targets may reduce image dimensions to meet the size limit.
                  </p>
                </div>
              )}

              <button
                onClick={compress}
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                Compress {files.length > 1 ? `${files.length} images` : "image"}
              </button>
            </div>
          )}

          {status === "processing" && <ProgressBar label="Compressing images…" />}
          {status === "error" && <p className="text-red-500 text-sm text-center">{error}</p>}
        </>
      )}

      {status === "done" && (
        <div className="space-y-4">
          {/* Summary */}
          {results.length > 1 && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-center">
              <span className="text-green-700 font-semibold">
                Total saved:{" "}
                {fmt(results.reduce((s, r) => s + r.originalSize - r.compressedSize, 0))}
              </span>
              <span className="text-green-600">
                {" "}
                (
                {Math.round(
                  (1 -
                    results.reduce((s, r) => s + r.compressedSize, 0) /
                      results.reduce((s, r) => s + r.originalSize, 0)) *
                    100,
                )}
                % reduction across all images)
              </span>
            </div>
          )}

          <h3 className="font-semibold text-gray-800">Results</h3>
          {results.map((r) => {
            const saved = Math.round((1 - r.compressedSize / r.originalSize) * 100);
            const couldntCompress = r.compressedSize >= r.originalSize;
            return (
              <div
                key={r.name}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 truncate text-sm">{r.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">{fmt(r.originalSize)}</span>
                      <span className="text-gray-300 text-xs">→</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {fmt(r.compressedSize)}
                      </span>
                      {couldntCompress ? (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          Already optimal
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                          {saved}% smaller
                        </span>
                      )}
                    </div>
                    {/* Mini progress bar showing reduction */}
                    {!couldntCompress && (
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 bg-green-400 rounded-full"
                          style={{ width: `${100 - saved}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <a
                    href={r.url}
                    download={`compressed_${r.name}`}
                    className="shrink-0 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Download
                  </a>
                </div>
              </div>
            );
          })}

          <button
            onClick={reset}
            className="w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Compress more images
          </button>
        </div>
      )}
    </div>
  );
}
