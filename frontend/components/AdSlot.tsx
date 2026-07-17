"use client";

/**
 * Reserved ad slot — empty placeholder for now.
 * Activate by dropping an ad network script here in a later phase.
 */
export default function AdSlot({ label = "Advertisement" }: { label?: string }) {
  return (
    <div className="w-full max-w-2xl mx-auto my-6 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center h-24 text-xs text-gray-300 select-none">
      {label}
    </div>
  );
}
