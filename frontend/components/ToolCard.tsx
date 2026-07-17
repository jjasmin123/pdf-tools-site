import Link from "next/link";
import type { Tool } from "@/lib/tools";

const CATEGORY_COLORS: Record<string, string> = {
  pdf: "bg-red-50 text-red-600 border-red-100 hover:border-red-300 hover:bg-red-50",
  image: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300 hover:bg-blue-50",
  word: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50",
  excel: "bg-green-50 text-green-600 border-green-100 hover:border-green-300 hover:bg-green-50",
};

const ICON_BG: Record<string, string> = {
  pdf: "bg-red-100 text-red-500",
  image: "bg-blue-100 text-blue-500",
  word: "bg-indigo-100 text-indigo-500",
  excel: "bg-green-100 text-green-500",
};

export default function ToolCard({ tool }: { tool: Tool }) {
  const colorClass =
    CATEGORY_COLORS[tool.category] ??
    "bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-300";
  const iconBg = ICON_BG[tool.category] ?? "bg-gray-100 text-gray-500";

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`group flex flex-col gap-3 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${colorClass}`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold ${iconBg}`}
      >
        {tool.icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-inherit mb-1 text-base">
          {tool.name}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{tool.description}</p>
      </div>
      {tool.clientSide && (
        <span className="self-start text-xs font-semibold uppercase tracking-wide bg-white/70 text-gray-400 px-2 py-0.5 rounded-full border border-gray-200">
          In-browser
        </span>
      )}
    </Link>
  );
}
