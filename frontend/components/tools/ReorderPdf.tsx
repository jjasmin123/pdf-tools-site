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

export default function ReorderPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [status, setStatus] = useState<"idle" | "ready" | "uploading" | "done" | "error">("idle");
  const [downloadId, setDownloadId] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [error, setError] = useState("");

  async function onFiles(incoming: File[]) {
    if (incoming.length === 0) return;
    const f = incoming[0];
    setFile(f);
    setStatus("idle");
    setDownloadId("");
    setError("");
    setInfoError("");
    setFetchingInfo(true);

    const form = new FormData();
    form.append("file", f);
    try {
      const resp = await fetch(`${API_BASE}/api/pdf/info`, { method: "POST", body: form });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ detail: "Could not read PDF." }));
        throw new Error(typeof body.detail === "string" ? body.detail : "Could not read PDF.");
      }
      const data: { page_count: number } = await resp.json();
      setOrder(Array.from({ length: data.page_count }, (_, i) => i));
      setStatus("ready");
    } catch (e) {
      setInfoError(e instanceof Error ? e.message : "Could not read this PDF.");
      setFile(null);
    } finally {
      setFetchingInfo(false);
    }
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...order];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setOrder(next);
  }

  function moveDown(i: number) {
    if (i === order.length - 1) return;
    const next = [...order];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setOrder(next);
  }

  async function applyReorder() {
    if (!file) return;
    setStatus("uploading");
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("order", JSON.stringify(order));
    try {
      const resp = await fetch(`${API_BASE}/api/pdf/reorder`, { method: "POST", body: form });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ detail: "Reorder failed." }));
        throw new Error(typeof body.detail === "string" ? body.detail : "Reorder failed.");
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
    setOrder([]);
    setDownloadId("");
    setDownloadName("");
    setStatus("idle");
    setError("");
    setInfoError("");
  }

  const isDefaultOrder = order.every((v, i) => v === i);

  return (
    <div className="space-y-6">
      {status !== "done" && (
        <>
          {status === "idle" && !fetchingInfo && (
            <>
              <UploadZone accept="application/pdf" onFiles={onFiles} hint="Accepted: .pdf · max 25 MB" />
              {infoError && <p className="text-red-500 text-sm text-center">{infoError}</p>}
            </>
          )}

          {fetchingInfo && <ProgressBar label="Reading PDF pages…" />}

          {(status === "ready" || status === "uploading" || status === "error") && file && (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 truncate min-w-0">
                  <span className="shrink-0">📄</span>
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-400 font-normal shrink-0">{order.length} pages · {fmt(file.size)}</span>
                </span>
                <button onClick={reset} className="text-gray-300 hover:text-red-400 transition-colors ml-3 shrink-0">✕</button>
              </div>

              {status !== "uploading" && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Move pages into the order you want</p>
                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                    {order.map((originalPage, i) => (
                      <div
                        key={`${originalPage}-${i}`}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm"
                      >
                        <span className="text-xs text-gray-300 w-5 text-right shrink-0 tabular-nums">{i + 1}</span>
                        <span className="flex-1 text-sm font-medium text-gray-700">
                          Page {originalPage + 1}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => moveUp(i)}
                            disabled={i === 0}
                            aria-label="Move up"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed text-[10px]"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveDown(i)}
                            disabled={i === order.length - 1}
                            aria-label="Move down"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed text-[10px]"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isDefaultOrder && order.length > 1 && (
                    <p className="text-xs text-amber-600 text-center bg-amber-50 border border-amber-200 rounded-lg py-2">
                      Pages are in original order — use ▲▼ to rearrange
                    </p>
                  )}

                  <button
                    onClick={applyReorder}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors mt-2"
                  >
                    Apply new order
                  </button>
                </div>
              )}

              {status === "uploading" && <ProgressBar label="Applying new page order…" />}

              {status === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-700 text-sm font-medium">Reorder failed</p>
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                  <button onClick={() => setStatus("ready")} className="text-xs text-red-600 underline mt-2">Try again</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {status === "done" && (
        <div className="text-center space-y-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto border border-red-200 bg-red-50">✅</div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">Pages reordered!</p>
            <p className="text-sm text-gray-400 mt-1">{downloadName}</p>
          </div>
          <DownloadButton fileId={downloadId} filename={downloadName} label="Download" />
          <div>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline">Reorder another file</button>
          </div>
        </div>
      )}
    </div>
  );
}
