import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "PDFTools privacy policy — we delete your files immediately after conversion and never store them.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: July 2026</p>

      <div className="space-y-8 text-[15px] leading-relaxed text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">File handling</h2>
          <p>
            When you upload a file for conversion, it is processed on our server solely to perform
            the requested conversion.{" "}
            <strong>
              Your file is permanently deleted from our servers immediately after the converted
              output has been sent to your browser.
            </strong>{" "}
            We do not retain, copy, index, or back up uploaded files at any point. Browser-based
            tools (marked &quot;In-browser&quot;) never leave your device at all.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Data we collect</h2>
          <p>
            We do not collect personal information. We may log aggregate, anonymised request
            statistics (e.g. number of conversions per tool) for capacity planning. These logs
            contain no file content, filenames, or user identifiers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cookies</h2>
          <p>
            We use only essential session cookies required for the site to function. We do not use
            tracking or advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Third parties</h2>
          <p>
            We do not sell or share any data with third parties. If we add analytics in the future,
            we will update this policy and use only privacy-respecting, cookieless tools.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Contact</h2>
          <p>
            Questions about this policy? Use the{" "}
            <a href="/contact" className="text-red-600 hover:underline">
              Contact
            </a>{" "}
            page.
          </p>
        </section>
      </div>
    </div>
  );
}
