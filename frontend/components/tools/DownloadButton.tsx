"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Props = {
  fileId: string;
  filename: string;
  initialRemaining?: number;
  className?: string;
  label?: string;
};

export default function DownloadButton({
  fileId,
  filename,
  initialRemaining = 2,
  className,
  label,
}: Props) {
  const [remaining, setRemaining] = useState(initialRemaining);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    if (remaining <= 0 || loading) return;
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`${API_BASE}/api/pdf/download/${fileId}`);
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.detail ?? "Download failed. Please convert again.");
      }
      const remainingHeader = resp.headers.get("X-Downloads-Remaining");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setRemaining(remainingHeader !== null ? parseInt(remainingHeader, 10) : (r) => Math.max(0, r - 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed. Please convert again.");
    } finally {
      setLoading(false);
    }
  }

  const exhausted = remaining <= 0;

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        disabled={loading || exhausted}
        className={
          className ??
          "w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        }
      >
        {loading ? "Downloading…" : exhausted ? "Download limit reached" : (label ?? "Download")}
      </button>
      {!exhausted && (
        <p className="text-center text-xs text-gray-400">
          {remaining} download{remaining !== 1 ? "s" : ""} remaining · file auto-deleted from our servers after
        </p>
      )}
      {exhausted && (
        <p className="text-center text-xs text-amber-600">
          This file has been permanently deleted from our servers. Convert again for a fresh copy.
        </p>
      )}
      {error && <p className="text-center text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
