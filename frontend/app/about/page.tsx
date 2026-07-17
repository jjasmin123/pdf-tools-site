import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PDFTools",
  description:
    "Learn about PDFTools — fast, free, and private file conversion tools built for everyone.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About PDFTools</h1>
      <div className="prose prose-gray text-gray-600 space-y-4 text-[15px] leading-relaxed">
        <p>
          PDFTools is a free collection of online file conversion utilities designed to be fast,
          clean, and completely private. We built it because existing tools are cluttered with ads,
          require sign-ups, or are simply too slow.
        </p>
        <p>
          Every tool on this site either runs entirely in your browser (no server upload at all) or
          deletes your files immediately after the conversion is complete. We do not store, analyse,
          or sell your documents.
        </p>
        <p>
          Our goal is simple: give you the tools you need, get out of the way, and keep everything
          free.
        </p>
      </div>
    </div>
  );
}
