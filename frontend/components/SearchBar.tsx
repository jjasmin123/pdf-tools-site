"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TOOLS } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

const ALIASES: Record<string, string[]> = {
  doc: ["word"],
  docx: ["word"],
  xls: ["excel"],
  xlsx: ["excel"],
  photo: ["image"],
  picture: ["image"],
  pic: ["image"],
  jpg: ["jpg", "jpeg", "image"],
  jpeg: ["jpg", "jpeg", "image"],
  png: ["image"],
  img: ["image"],
  size: ["compress"],
  small: ["compress"],
  shrink: ["compress"],
  reduce: ["compress"],
  combine: ["merge"],
  join: ["merge"],
  lock: ["protect"],
  password: ["protect", "unlock"],
  stamp: ["watermark"],
  flip: ["rotate"],
  rearrange: ["reorder"],
  sort: ["reorder"],
};

function score(tool: Tool, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const haystack = [
    tool.name,
    tool.description,
    tool.slug.replace(/-/g, " "),
    tool.category,
  ]
    .join(" ")
    .toLowerCase();

  if (tool.name.toLowerCase().includes(q)) return 3;
  if (haystack.includes(q)) return 2;

  const words = q.split(/\s+/);
  for (const w of words) {
    const expanded = ALIASES[w] ?? [];
    for (const alias of expanded) {
      if (haystack.includes(alias)) return 1;
    }
  }
  return 0;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results =
    query.trim()
      ? TOOLS.map((t) => ({ tool: t, s: score(t, query) }))
          .filter((x) => x.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 6)
          .map((x) => x.tool)
      : [];

  const navigate = useCallback(
    (tool: Tool) => {
      router.push(`/tools/${tool.slug}`);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [router]
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIdx]) navigate(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-sm mx-4">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search tools… e.g. compress PDF"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all placeholder:text-gray-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm leading-none"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map((tool, idx) => (
            <li key={tool.slug}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  navigate(tool);
                }}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  idx === activeIdx ? "bg-red-50" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-xl flex-shrink-0">{tool.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {tool.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {tool.description}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 px-4 py-3 text-sm text-gray-500">
          No tools found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
