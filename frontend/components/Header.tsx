import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-red-600 flex-shrink-0"
        >
          <span className="text-2xl">📄</span>
          <span className="hidden sm:inline">PDFTools</span>
        </Link>

        <SearchBar />

        <nav className="hidden lg:flex items-center gap-6 text-base font-medium text-gray-600 flex-shrink-0">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-red-600 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-red-600 transition-colors">
            Contact
          </Link>
        </nav>

        <button className="text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors flex-shrink-0">
          Go Pro
        </button>
      </div>
    </header>
  );
}
