import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "PDFTools terms of service — free to use, please don't abuse it.",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: July 2026</p>

      <div className="space-y-8 text-[15px] leading-relaxed text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Use of the service</h2>
          <p>
            PDFTools is provided free of charge for personal and commercial use. You may use it to
            convert files you own or have the right to process. You may not use it for illegal
            purposes or to convert files containing malware.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">File size and rate limits</h2>
          <p>
            Free tier uploads are limited to 25 MB per file. We apply per-IP rate limiting to
            prevent abuse. Repeated high-volume automated usage may be blocked without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No warranty</h2>
          <p>
            The service is provided &quot;as is&quot; without warranty of any kind. We are not
            liable for any data loss or damage resulting from the use of these tools. Always keep
            backups of important files.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Changes</h2>
          <p>
            We may update these terms at any time. Continued use of the service after changes are
            posted constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
