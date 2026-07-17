"use client";

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  files: File[];
  onRemove?: (index: number) => void;
};

export default function FileList({ files, onRemove }: Props) {
  if (files.length === 0) return null;
  return (
    <ul className="mt-4 space-y-2">
      {files.map((f, i) => (
        <li
          key={`${f.name}-${i}`}
          className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-2.5 text-sm shadow-sm"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="text-base">📄</span>
            <span className="truncate text-gray-700 font-medium">{f.name}</span>
          </span>
          <span className="flex items-center gap-3 shrink-0 ml-3">
            <span className="text-gray-400 text-xs">{fmt(f.size)}</span>
            {onRemove && (
              <button
                onClick={() => onRemove(i)}
                className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none"
                aria-label="Remove file"
              >
                ✕
              </button>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
