"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import ProgressBar from "./ProgressBar";
import DownloadButton from "./DownloadButton";

type Props = {
  endpoint: string;
  acceptMime: string;
  acceptLabel: string;
  outputExtension: string;
  outputMime: string;
  accentColor: "red" | "indigo" | "green" | "blue";
};

const ACCENT = {
  red: { btn: "bg-red-600 hover:bg-red-700", badge: "bg-red-50 text-red-600 border-red-200" },
  indigo: {
    btn: "bg-indigo-600 hover:bg-indigo-700",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  green: {
    btn: "bg-green-600 hover:bg-green-700",
    badge: "bg-green-50 text-green-600 border-green-200",
  },
  blue: { btn: "bg-blue-600 hover:bg-blue-700", badge: "bg-blue-50 text-blue-600 border-blue-200" },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ServerToolUpload({
  endpoint,
  acceptMime,
  acceptLabel,
  outputExtension,
  outputMime: _outputMime,
  accentColor,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
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

  async function convert() {
    if (!file) return;
    setStatus("uploading");
    setError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const resp = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ detail: "Conversion failed." }));
        const msg = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
        throw new Error(msg);
      }

      const data = await resp.json();
      setDownloadId(data.file_id);
      setDownloadName(data.filename || `${file.name.replace(/\.[^.]+$/, "")}.${outputExtension}`);
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
    setStatus("idle");
    setError("");
  }

  const colors = ACCENT[accentColor];

  return (
    <div className="space-y-6">
      {status !== "done" && (
        <>
          {!file ? (
            <UploadZone
              accept={acceptMime}
              onFiles={onFiles}
              hint={`Accepted: ${acceptLabel} · max 25 MB`}
            />
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700 truncate">
                <span>📄</span>
                <span className="truncate">{file.name}</span>
                <span className="text-gray-400 font-normal shrink-0">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </span>
              <button
                onClick={reset}
                className="text-gray-300 hover:text-red-400 transition-colors ml-3 shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          {file && status !== "uploading" && (
            <button
              onClick={convert}
              className={`w-full text-white font-semibold py-3 rounded-xl transition-colors ${colors.btn}`}
            >
              Convert now
            </button>
          )}

          {status === "uploading" && (
            <ProgressBar label="Uploading and converting… this may take a few seconds" />
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm font-medium">Conversion failed</p>
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
        <div className="text-center space-y-5">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto border ${colors.badge}`}
          >
            ✅
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">Your file is ready!</p>
            <p className="text-sm text-gray-400 mt-1">{downloadName}</p>
          </div>
          <DownloadButton
            fileId={downloadId}
            filename={downloadName}
            label="Download"
            className={`w-full text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors.btn}`}
          />
          <div>
            <button
              onClick={reset}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Convert another file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
