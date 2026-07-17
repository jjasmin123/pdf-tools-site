"use client";

export default function ProgressBar({ label = "Processing…" }: { label?: string }) {
  return (
    <div className="mt-6 text-center space-y-3">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-red-500 rounded-full animate-[progress_1.5s_ease-in-out_infinite]"
          style={{ width: "60%" }}
        />
      </div>
      <style>{`
        @keyframes progress {
          0%   { width: 10%; margin-left: 0; }
          50%  { width: 60%; margin-left: 20%; }
          100% { width: 10%; margin-left: 90%; }
        }
      `}</style>
    </div>
  );
}
