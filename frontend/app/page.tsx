import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "PDFTools — Free Online PDF & File Converter",
  description:
    "Merge, split, compress, and convert PDFs, images, Word, and Excel files instantly. Free, fast, no signup required. Files deleted immediately after conversion.",
};

const CATEGORY_ACCENT: Record<string, string> = {
  pdf: "text-red-600",
  image: "text-blue-600",
  word: "text-indigo-600",
  excel: "text-green-600",
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
          All your file tools, <span className="text-red-600">one place</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto mb-6">
          Convert, compress, and transform PDFs, images, Word and Excel files — free, fast, and
          fully private.
        </p>
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
          <span>🔒</span>
          Files are automatically deleted after conversion. We never store or view your files.
        </div>
      </section>

      <AdSlot />

      {/* Tool grid by category */}
      <section className="max-w-6xl mx-auto px-4 pb-20 space-y-14">
        {CATEGORIES.map((category) => (
          <div key={category.id}>
            <h2
              className={`text-3xl font-bold mb-6 flex items-center gap-2 ${CATEGORY_ACCENT[category.id] ?? "text-gray-800"}`}
            >
              {category.label}
              <span className="text-base font-normal text-gray-400 ml-1">
                ({category.tools.length} tools)
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Trust section */}
      <section className="bg-gray-50 border-t border-gray-100 py-14 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-10">Why PDFTools?</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: "⚡",
              title: "Instant processing",
              body: "Most conversions complete in under 5 seconds, right in your browser.",
            },
            {
              icon: "🔒",
              title: "Your files stay private",
              body: "Files are deleted from our servers the moment your download is ready.",
            },
            {
              icon: "🆓",
              title: "Always free",
              body: "Core tools are free forever. No account required, no credit card needed.",
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col items-center gap-3">
              <span className="text-4xl">{icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-base text-gray-500">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
