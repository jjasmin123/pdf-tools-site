import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-medium text-gray-700">📄 PDFTools — Fast, free, private.</p>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link href="/privacy" className="hover:text-red-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-red-600 transition-colors">
            Terms of Service
          </Link>
          <Link href="/about" className="hover:text-red-600 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-red-600 transition-colors">
            Contact
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} PDFTools</p>
      </div>
    </footer>
  );
}
