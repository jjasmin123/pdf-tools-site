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

export default function ProtectPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = !!file && password.length >= 4 && password === confirm;

  async function protect() {
    if (!canSubmit || !file) return;
    setStatus("uploading");
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("password", password);
    try {
      const resp = await fetch(`${API_BASE}/api/pdf/protect`, { method: "POST", body: form });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ detail: "Protection failed." }));
        throw new Error(typeof body.detail === "string" ? body.detail : "Protection failed.");
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
    setPassword("");
    setConfirm("");
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
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Set password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Confirm password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white ${
                        mismatch ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-red-300"
                      }`}
                    />
                    {mismatch && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <p className="text-amber-800 text-xs font-medium">
                      ⚠️ Save your password somewhere safe. There is no way to recover a lost PDF password.
                    </p>
                  </div>

                  <button
                    onClick={protect}
                    disabled={!canSubmit}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Protect PDF
                  </button>
                </div>
              )}
            </>
          )}

          {status === "uploading" && <ProgressBar label="Encrypting PDF with AES-256…" />}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm font-medium">Protection failed</p>
              <p className="text-red-500 text-xs mt-1">{error}</p>
              <button onClick={() => setStatus("idle")} className="text-xs text-red-600 underline mt-2">Try again</button>
            </div>
          )}
        </>
      )}

      {status === "done" && (
        <div className="text-center space-y-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto border border-red-200 bg-red-50">🔒</div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">PDF protected!</p>
            <p className="text-sm text-gray-400 mt-1">{downloadName}</p>
          </div>
          <DownloadButton fileId={downloadId} filename={downloadName} label="Download" />
          <div>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline">Protect another file</button>
          </div>
        </div>
      )}
    </div>
  );
}
